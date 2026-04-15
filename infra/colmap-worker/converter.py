"""
Point cloud / Mesh to GLB converter — v4
COLMAP sparse/dense PLY → GLB with correct colors for three.js/model-viewer.

Fixes v4:
    1. Y-axis flip (COLMAP Y-down → WebGL Y-up)
    2. GLB material injection so three.js renders COLOR_0 vertex colors
    3. Nearest-neighbor color mapping
    4. DBSCAN keep-largest-cluster (always, no 30% threshold)
    5. 4-stage point cloud cleaning (2 statistical passes)
    6. Better normal estimation with outward-orientation check
    7. Poisson density quantile raised → fewer low-density floaters
    8. Post-mesh island removal → fixes floating leaf/debris artifacts
    9. doubleSided material in GLB

---
For Roomie 3D property models: creates a proper mesh from COLMAP point clouds using Open3D surface reconstruction.

Reconstruction methods (priority order):
    1. Poisson Surface Reconstruction (best quality, needs normals)
    2. Ball Pivoting Algorithm (good for sparse/noisy clouds)
    3. Delaunay Triangulation (scipy fallback)
    4. Convex Hull (last resort)
"""

import json
import logging
import struct
import trimesh
import numpy as np

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Public entry point
# ─────────────────────────────────────────────────────────────

def mesh_to_glb(input_path, output_path):
    """Convert a PLY file (point cloud or mesh) to GLB format."""
    logger.info(f"Converting {input_path} → {output_path}")

    mesh = trimesh.load(input_path)
    logger.info(f"Loaded: type={type(mesh).__name__}")

    if isinstance(mesh, trimesh.PointCloud):
        vertices = np.array(mesh.vertices, dtype=np.float64)
        colors = np.array(mesh.colors) if mesh.colors is not None else None
        n_points = len(vertices)
        logger.info(f"Point cloud: {n_points} points")

        if n_points < 4:
            raise RuntimeError(f"Too few points ({n_points})")

        # Fix Y axis (COLMAP Y-down → WebGL Y-up)
        vertices[:, 1] = -vertices[:, 1]

        scene = _reconstruct_surface(vertices, colors, n_points)

    elif isinstance(mesh, trimesh.Scene):
        scene = mesh
    else:
        if hasattr(mesh, 'remove_degenerate_faces'):
            mesh.remove_degenerate_faces()
        if hasattr(mesh, 'remove_duplicate_faces'):
            mesh.remove_duplicate_faces()
        if hasattr(mesh, 'faces') and len(mesh.faces) > 400_000:
            mesh = mesh.simplify_quadric_decimation(400_000)
        scene = trimesh.Scene(mesh)

    glb_bytes = scene.export(file_type='glb')
    glb_bytes = _inject_vertex_color_material(glb_bytes)

    with open(output_path, 'wb') as f:
        f.write(glb_bytes)

    logger.info(f"GLB exported: {len(glb_bytes)/1024/1024:.2f} MB → {output_path}")
    return output_path


# ─────────────────────────────────────────────────────────────
# GLB material injection
# ─────────────────────────────────────────────────────────────

def _inject_vertex_color_material(glb_bytes: bytes) -> bytes:
    try:
        magic, version, _ = struct.unpack_from('<III', glb_bytes, 0)
        json_chunk_len, json_chunk_type = struct.unpack_from('<II', glb_bytes, 12)

        if json_chunk_type != 0x4E4F534A:
            logger.warning("GLB JSON chunk not found — skipping material injection")
            return glb_bytes

        json_start = 20
        json_end = json_start + json_chunk_len
        j = json.loads(glb_bytes[json_start:json_end])

        mat = {
            "name": "vertex_colors",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.0,
                "roughnessFactor": 0.85,
            },
            "doubleSided": True,
        }

        if 'materials' not in j:
            j['materials'] = []
        mat_idx = len(j['materials'])
        j['materials'].append(mat)

        assigned = 0
        for mesh in j.get('meshes', []):
            for prim in mesh.get('primitives', []):
                if 'COLOR_0' in prim.get('attributes', {}):
                    prim['material'] = mat_idx
                    assigned += 1

        logger.info(f"Material injected for {assigned} primitive(s)")

        new_json = json.dumps(j, separators=(',', ':')).encode('utf-8')
        pad = (4 - len(new_json) % 4) % 4
        new_json += b' ' * pad

        new_json_chunk = struct.pack('<II', len(new_json), 0x4E4F534A) + new_json
        bin_chunk = glb_bytes[json_end:]
        total_len = 12 + len(new_json_chunk) + len(bin_chunk)
        new_header = struct.pack('<III', magic, version, total_len)
        return new_header + new_json_chunk + bin_chunk

    except Exception as e:
        logger.warning(f"Material injection failed ({e}) — using original GLB")
        return glb_bytes


# ─────────────────────────────────────────────────────────────
# Color helpers
# ─────────────────────────────────────────────────────────────

def _prepare_colors(colors) -> np.ndarray | None:
    if colors is None or len(colors) == 0:
        return None
    c = np.asarray(colors)
    if c.ndim != 2 or c.shape[1] < 3:
        return None
    c = c[:, :3]
    if c.dtype in (np.float32, np.float64):
        c = (np.clip(c, 0.0, 1.0) * 255).astype(np.uint8)
    else:
        c = c.astype(np.uint8)
    return c


def _rgba(rgb: np.ndarray) -> np.ndarray:
    return np.hstack([rgb, np.full((len(rgb), 1), 255, dtype=np.uint8)])


def _nearest_color(source_pts, source_rgb, target_pts):
    from scipy.spatial import cKDTree
    _, idx = cKDTree(source_pts).query(target_pts)
    rgb = _prepare_colors(source_rgb[idx])
    return rgb if rgb is not None else np.full((len(target_pts), 3), 180, dtype=np.uint8)


# ─────────────────────────────────────────────────────────────
# Point cloud cleanup — v4 (4-stage, more aggressive)
# ─────────────────────────────────────────────────────────────

def _clean_cloud(pcd, rgb):
    """
    4-stage cleanup:
      1. Statistical outlier removal (std_ratio=1.5)
      2. Radius outlier removal (scene-scale adaptive)
      3. DBSCAN — ALWAYS keep the single largest cluster
      4. Second-pass statistical filter to remove remaining halos
    """
    import open3d as o3d

    n0 = len(pcd.points)

    # Stage 1
    pcd, idx1 = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=1.5)
    if rgb is not None:
        rgb = rgb[np.asarray(idx1)]
    logger.info(f"Statistical filter: {n0} → {len(pcd.points)}")

    if len(pcd.points) < 10:
        raise RuntimeError("Too few points after statistical filter")

    # Stage 2: radius (scene-scale)
    extent = np.asarray(pcd.get_axis_aligned_bounding_box().get_extent())
    scene_scale = float(np.max(extent))
    radius = scene_scale * 0.03
    logger.info(f"Scene scale={scene_scale:.3f}, radius={radius:.4f}")

    pcd, idx2 = pcd.remove_radius_outlier(nb_points=8, radius=radius)
    if rgb is not None:
        rgb = rgb[np.asarray(idx2)]
    logger.info(f"Radius filter: → {len(pcd.points)}")

    # Stage 3: DBSCAN — always keep only largest cluster
    if len(pcd.points) >= 20:
        eps = scene_scale * 0.04
        labels = np.array(
            pcd.cluster_dbscan(eps=eps, min_points=10, print_progress=False)
        )
        if labels.max() >= 0:
            unique, counts = np.unique(labels[labels >= 0], return_counts=True)
            largest_label = unique[np.argmax(counts)]
            n_clusters = labels.max() + 1
            logger.info(f"DBSCAN: {n_clusters} clusters, largest={counts.max()}")

            mask = labels == largest_label
            pts_arr = np.asarray(pcd.points)[mask]
            clr_arr = np.asarray(pcd.colors)[mask] if pcd.has_colors() else None

            new_pcd = o3d.geometry.PointCloud()
            new_pcd.points = o3d.utility.Vector3dVector(pts_arr)
            if clr_arr is not None:
                new_pcd.colors = o3d.utility.Vector3dVector(clr_arr)

            if rgb is not None:
                rgb = rgb[mask]
            pcd = new_pcd
            logger.info(f"DBSCAN keep-largest: → {len(pcd.points)}")

    # Stage 4: second statistical pass
    if len(pcd.points) > 20:
        pcd, idx4 = pcd.remove_statistical_outlier(nb_neighbors=15, std_ratio=2.0)
        if rgb is not None:
            rgb = rgb[np.asarray(idx4)]
        logger.info(f"2nd statistical pass: → {len(pcd.points)}")

    return pcd, rgb


# ─────────────────────────────────────────────────────────────
# Normal estimation — v4
# ─────────────────────────────────────────────────────────────

def _estimate_normals_outward(pcd, scene_scale):
    """
    Estimate normals and orient them consistently outward.
    Uses a camera location slightly above centroid for outdoor scans.
    """
    import open3d as o3d

    r = scene_scale * 0.025
    pcd.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=r, max_nn=30)
    )

    center = np.asarray(pcd.get_center())
    # Camera slightly above center — better for building/exterior scans
    camera_loc = center + np.array([0, scene_scale * 0.5, 0])
    pcd.orient_normals_towards_camera_location(camera_location=camera_loc)

    # Propagate consistently
    pcd.orient_normals_consistent_tangent_plane(k=15)

    # Sanity check: majority should point away from centroid
    normals = np.asarray(pcd.normals)
    pts = np.asarray(pcd.points)
    dirs = pts - center
    dots = np.einsum('ij,ij->i', normals, dirs)
    frac_out = (dots > 0).mean()
    logger.info(f"Normals pointing outward: {frac_out:.1%}")

    if frac_out < 0.45:
        logger.info("Majority inward — flipping all normals")
        pcd.normals = o3d.utility.Vector3dVector(-normals)

    return pcd


# ─────────────────────────────────────────────────────────────
# Post-mesh island removal
# ─────────────────────────────────────────────────────────────

def _remove_mesh_islands(mesh_o3d, min_fraction=0.05):
    """
    Remove disconnected mesh components smaller than min_fraction of largest.
    This is the key fix for 'floating leaf/debris' artifacts.
    """
    triangle_clusters, cluster_n_triangles, _ = (
        mesh_o3d.cluster_connected_triangles()
    )
    triangle_clusters = np.asarray(triangle_clusters)
    cluster_n_triangles = np.asarray(cluster_n_triangles)

    if len(cluster_n_triangles) == 0:
        return mesh_o3d

    max_triangles = cluster_n_triangles.max()
    threshold = max_triangles * min_fraction

    keep_mask = cluster_n_triangles[triangle_clusters] >= threshold
    mesh_o3d.remove_triangles_by_mask(~keep_mask)
    mesh_o3d.remove_unreferenced_vertices()

    n_kept = keep_mask.sum()
    logger.info(
        f"Island removal: kept {n_kept}/{len(keep_mask)} triangles "
        f"(threshold={threshold:.0f})"
    )
    return mesh_o3d


# ─────────────────────────────────────────────────────────────
# Mesh normal fix
# ─────────────────────────────────────────────────────────────

def _fix_normals_outward(mesh_o3d):
    """Flip faces so normals point away from centroid."""
    import open3d as o3d

    try:
        mesh_o3d.orient_triangles()
    except Exception:
        pass

    mesh_o3d.compute_vertex_normals()
    verts = np.asarray(mesh_o3d.vertices)
    normals = np.asarray(mesh_o3d.vertex_normals)
    centroid = verts.mean(axis=0)
    dots = np.einsum('ij,ij->i', normals, verts - centroid)
    frac_out = (dots > 0).mean()
    logger.info(f"Mesh normals outward: {frac_out:.1%}")

    if frac_out < 0.5:
        logger.info("Flipping mesh faces outward")
        mesh_o3d.triangles = o3d.utility.Vector3iVector(
            np.asarray(mesh_o3d.triangles)[:, ::-1]
        )
        mesh_o3d.compute_vertex_normals()

    return mesh_o3d


# ─────────────────────────────────────────────────────────────
# Surface reconstruction
# ─────────────────────────────────────────────────────────────

def _reconstruct_surface(vertices, colors, n_points):
    try:
        return _poisson(vertices, colors, n_points)
    except Exception as e:
        logger.warning(f"Poisson failed: {e}")

    try:
        return _ball_pivoting(vertices, colors)
    except Exception as e:
        logger.warning(f"Ball pivoting failed: {e}")

    try:
        return _delaunay(vertices, colors)
    except Exception as e:
        logger.warning(f"Delaunay failed: {e}")

    logger.warning("All methods failed — convex hull fallback")
    pc = trimesh.PointCloud(vertices)
    hull = pc.convex_hull
    rgb = _prepare_colors(colors)
    if rgb is not None:
        hull.visual.vertex_colors = _rgba(_nearest_color(vertices, rgb, hull.vertices))
    return trimesh.Scene(hull)


def _poisson(vertices, colors, n_points):
    import open3d as o3d

    rgb = _prepare_colors(colors)

    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(vertices)
    if rgb is not None:
        pcd.colors = o3d.utility.Vector3dVector(rgb.astype(np.float64) / 255.0)

    pcd, rgb = _clean_cloud(pcd, rgb)
    n_clean = len(pcd.points)
    if n_clean < 10:
        raise RuntimeError("Too few points after cleaning")

    clean_pts = np.asarray(pcd.points).copy()

    extent = np.asarray(pcd.get_axis_aligned_bounding_box().get_extent())
    scene_scale = float(np.max(extent))

    pcd = _estimate_normals_outward(pcd, scene_scale)

    # depth=8 is safe for 12GB RAM; depth=9 needs ~24GB
    depth = 8 if n_clean > 50_000 else 7
    logger.info(f"Poisson depth={depth}, {n_clean} pts")

    mesh_o3d, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
        pcd, depth=depth, scale=1.1, linear_fit=False
    )
    densities = np.asarray(densities)

    # Raise quantile to remove low-density floaters (v4: 0.15 vs old 0.08)
    q = 0.15 if n_clean > 50_000 else 0.10
    mesh_o3d.remove_vertices_by_mask(densities < np.quantile(densities, q))
    logger.info(f"After density trim (q={q}): {len(mesh_o3d.triangles)} triangles")

    # Remove disconnected islands (key fix for floating debris)
    mesh_o3d = _remove_mesh_islands(mesh_o3d, min_fraction=0.05)

    if len(mesh_o3d.triangles) > 400_000:
        mesh_o3d = mesh_o3d.simplify_quadric_decimation(400_000)
        logger.info(f"Simplified to {len(mesh_o3d.triangles)} triangles")

    mesh_o3d = _fix_normals_outward(mesh_o3d)

    verts = np.asarray(mesh_o3d.vertices)
    faces = np.asarray(mesh_o3d.triangles)
    if len(faces) == 0:
        raise RuntimeError("Poisson produced empty mesh")

    t_mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)

    if rgb is not None:
        mapped = _nearest_color(clean_pts, rgb, verts)
        t_mesh.visual.vertex_colors = _rgba(mapped)
        logger.info(f"NN color mapping: {len(verts)} verts ← {len(clean_pts)} pts")
    else:
        logger.warning("No colors in point cloud")

    logger.info(f"Poisson final: {len(verts)} verts, {len(faces)} faces")
    return trimesh.Scene(t_mesh)


def _ball_pivoting(vertices, colors):
    import open3d as o3d

    rgb = _prepare_colors(colors)

    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(vertices)
    if rgb is not None:
        pcd.colors = o3d.utility.Vector3dVector(rgb.astype(np.float64) / 255.0)

    pcd, rgb = _clean_cloud(pcd, rgb)
    clean_pts = np.asarray(pcd.points).copy()

    extent = np.asarray(pcd.get_axis_aligned_bounding_box().get_extent())
    scene_scale = float(np.max(extent))

    pcd = _estimate_normals_outward(pcd, scene_scale)

    distances = pcd.compute_nearest_neighbor_distance()
    avg_d = float(np.mean(distances))
    radii = [avg_d * 1.5, avg_d * 3.0, avg_d * 6.0]

    mesh_o3d = o3d.geometry.TriangleMesh.create_from_point_cloud_ball_pivoting(
        pcd, o3d.utility.DoubleVector(radii)
    )
    mesh_o3d = _remove_mesh_islands(mesh_o3d, min_fraction=0.05)
    mesh_o3d = _fix_normals_outward(mesh_o3d)

    verts = np.asarray(mesh_o3d.vertices)
    faces = np.asarray(mesh_o3d.triangles)
    if len(faces) == 0:
        raise RuntimeError("Ball pivoting produced empty mesh")

    t_mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
    if rgb is not None:
        t_mesh.visual.vertex_colors = _rgba(_nearest_color(clean_pts, rgb, verts))

    logger.info(f"Ball Pivoting: {len(verts)} verts, {len(faces)} faces")
    return trimesh.Scene(t_mesh)


def _delaunay(vertices, colors):
    from scipy.spatial import Delaunay

    tri = Delaunay(vertices)
    face_set = set()
    for simplex in tri.simplices:
        for i in range(4):
            face = tuple(sorted(simplex[j] for j in range(4) if j != i))
            face_set.discard(face) if face in face_set else face_set.add(face)
    faces = np.array(list(face_set))

    t_mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)

    rgb = _prepare_colors(colors)
    if rgb is not None:
        t_mesh.visual.vertex_colors = _rgba(rgb)

    _remove_long_edges(t_mesh)

    centroid = vertices.mean(axis=0)
    fixed = []
    for face in t_mesh.faces:
        v0, v1, v2 = vertices[face[0]], vertices[face[1]], vertices[face[2]]
        n = np.cross(v1 - v0, v2 - v0)
        fc = (v0 + v1 + v2) / 3
        fixed.append([face[0], face[2], face[1]] if np.dot(n, fc - centroid) < 0 else list(face))
    t_mesh.faces = np.array(fixed)

    logger.info(f"Delaunay: {len(t_mesh.vertices)} verts, {len(t_mesh.faces)} faces")
    return trimesh.Scene(t_mesh)


def _remove_long_edges(mesh, max_ratio=5.0):
    edges = mesh.edges_unique_length
    if len(edges) == 0:
        return
    threshold = np.median(edges) * max_ratio
    mask = []
    for face in mesh.faces:
        v = mesh.vertices[face]
        lens = [np.linalg.norm(v[i] - v[j]) for i, j in [(0,1),(1,2),(2,0)]]
        mask.append(max(lens) <= threshold)
    mesh.update_faces(mask)
