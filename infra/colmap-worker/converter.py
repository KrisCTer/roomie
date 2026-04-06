"""
Point cloud / Mesh to GLB converter.
Creates a proper mesh from COLMAP point clouds using Open3D surface reconstruction.
"""

import logging
import trimesh
import numpy as np

logger = logging.getLogger(__name__)


def mesh_to_glb(input_path, output_path):
    """Convert a PLY file (point cloud or mesh) to GLB format."""
    logger.info(f"Converting {input_path} → {output_path}")

    mesh = trimesh.load(input_path)
    logger.info(f"Loaded: type={type(mesh).__name__}")

    if isinstance(mesh, trimesh.PointCloud):
        vertices = np.array(mesh.vertices)
        colors = np.array(mesh.colors) if mesh.colors is not None else None
        n_points = len(vertices)
        logger.info(f"Point cloud with {n_points} points")

        if n_points < 4:
            raise RuntimeError(f"Too few points ({n_points}) for reconstruction")

        scene = _reconstruct_surface(vertices, colors, n_points)

    elif isinstance(mesh, trimesh.Scene):
        scene = mesh
    else:
        if hasattr(mesh, 'remove_degenerate_faces'):
            mesh.remove_degenerate_faces()
        if hasattr(mesh, 'remove_duplicate_faces'):
            mesh.remove_duplicate_faces()
        if hasattr(mesh, 'faces') and len(mesh.faces) > 500000:
            logger.info(f"Simplifying mesh from {len(mesh.faces)} to 500000 faces")
            mesh = mesh.simplify_quadric_decimation(500000)
        scene = trimesh.Scene(mesh)

    glb_data = scene.export(file_type='glb')
    with open(output_path, 'wb') as f:
        f.write(glb_data)

    file_size_mb = len(glb_data) / (1024 * 1024)
    logger.info(f"GLB exported: {file_size_mb:.2f} MB")
    return output_path


def _reconstruct_surface(vertices, colors, n_points):
    """Reconstruct mesh surface from 3D points."""

    try:
        return _open3d_poisson(vertices, colors, n_points)
    except Exception as e:
        logger.warning(f"Open3D Poisson failed: {e}")

    try:
        return _open3d_ball_pivoting(vertices, colors)
    except Exception as e:
        logger.warning(f"Open3D Ball Pivoting failed: {e}")

    try:
        return _delaunay_mesh(vertices, colors)
    except Exception as e:
        logger.warning(f"Delaunay failed: {e}")

    logger.warning("All methods failed, using convex hull")
    pc = trimesh.PointCloud(vertices)
    hull = pc.convex_hull
    if colors is not None and len(colors) > 0:
        hull.visual.vertex_colors = _map_colors_to_mesh(vertices, colors, hull.vertices)
    return trimesh.Scene(hull)


def _open3d_poisson(vertices, colors, n_points):
    """
    Open3D Poisson surface reconstruction.
    Params tuned cho cả dense (CUDA fused.ply) lẫn sparse cloud.
    """
    import open3d as o3d

    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(vertices)

    if colors is not None and len(colors) > 0:
        c = colors[:, :3].astype(np.float64)
        if c.max() > 1.0:
            c = c / 255.0
        pcd.colors = o3d.utility.Vector3dVector(np.clip(c, 0, 1))

    pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)
    n_clean = len(pcd.points)
    logger.info(f"After outlier removal: {n_clean} (from {n_points})")

    if n_clean < 10:
        raise RuntimeError("Too few points after outlier removal")

    bbox = pcd.get_axis_aligned_bounding_box()
    extent = np.asarray(bbox.get_extent())
    scene_scale = np.max(extent)
    radius = scene_scale * 0.02
    logger.info(f"Scene scale: {scene_scale:.3f}, normal radius: {radius:.4f}")

    pcd.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=radius, max_nn=30)
    )
    pcd.orient_normals_consistent_tangent_plane(k=15)

    depth = 9 if n_clean > 50000 else 7
    logger.info(f"Poisson depth={depth} for {n_clean} points...")

    mesh_o3d, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
        pcd, depth=depth, scale=1.1, linear_fit=False
    )

    densities = np.asarray(densities)
    q = 0.05 if n_clean > 50000 else 0.01
    mesh_o3d.remove_vertices_by_mask(densities < np.quantile(densities, q))

    if len(mesh_o3d.triangles) > 500000:
        mesh_o3d = mesh_o3d.simplify_quadric_decimation(500000)

    verts = np.asarray(mesh_o3d.vertices)
    faces = np.asarray(mesh_o3d.triangles)

    if len(faces) == 0:
        raise RuntimeError("Poisson produced empty mesh")

    t_mesh = trimesh.Trimesh(vertices=verts, faces=faces)

    if mesh_o3d.has_vertex_colors():
        t_mesh.visual.vertex_colors = (np.asarray(mesh_o3d.vertex_colors) * 255).astype(np.uint8)
    elif colors is not None and len(colors) > 0:
        t_mesh.visual.vertex_colors = _map_colors_to_mesh(vertices, colors, verts)

    logger.info(f"Poisson result: {len(verts)} vertices, {len(faces)} faces")
    return trimesh.Scene(t_mesh)


def _open3d_ball_pivoting(vertices, colors):
    """Ball Pivoting — tốt cho sparse/noisy cloud."""
    import open3d as o3d

    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(vertices)

    if colors is not None and len(colors) > 0:
        c = colors[:, :3].astype(np.float64)
        if c.max() > 1.0:
            c = c / 255.0
        pcd.colors = o3d.utility.Vector3dVector(np.clip(c, 0, 1))

    pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)

    distances = pcd.compute_nearest_neighbor_distance()
    avg_dist = np.mean(distances)
    radii = [avg_dist * 1.5, avg_dist * 3.0, avg_dist * 6.0]
    logger.info(f"Ball pivoting radii: {[f'{r:.4f}' for r in radii]}")

    bbox = pcd.get_axis_aligned_bounding_box()
    extent = np.asarray(bbox.get_extent())
    pcd.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(
            radius=np.max(extent) * 0.05, max_nn=30
        )
    )
    pcd.orient_normals_consistent_tangent_plane(k=15)

    mesh_o3d = o3d.geometry.TriangleMesh.create_from_point_cloud_ball_pivoting(
        pcd, o3d.utility.DoubleVector(radii)
    )

    verts = np.asarray(mesh_o3d.vertices)
    faces = np.asarray(mesh_o3d.triangles)

    if len(faces) == 0:
        raise RuntimeError("Ball pivoting produced empty mesh")

    t_mesh = trimesh.Trimesh(vertices=verts, faces=faces)
    if mesh_o3d.has_vertex_colors():
        t_mesh.visual.vertex_colors = (np.asarray(mesh_o3d.vertex_colors) * 255).astype(np.uint8)
    elif colors is not None and len(colors) > 0:
        t_mesh.visual.vertex_colors = _map_colors_to_mesh(vertices, colors, verts)

    logger.info(f"Ball Pivoting: {len(verts)} vertices, {len(faces)} faces")
    return trimesh.Scene(t_mesh)


def _delaunay_mesh(vertices, colors):
    """Scipy Delaunay 3D — fallback."""
    from scipy.spatial import Delaunay

    tri = Delaunay(vertices)
    faces = set()
    for simplex in tri.simplices:
        for i in range(4):
            face = tuple(sorted([simplex[j] for j in range(4) if j != i]))
            if face in faces:
                faces.discard(face)
            else:
                faces.add(face)
    faces = np.array(list(faces))

    t_mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
    if colors is not None and len(colors) > 0:
        t_mesh.visual.vertex_colors = colors[:, :3] if colors.shape[1] >= 3 else colors

    _remove_long_edges(t_mesh, max_ratio=5.0)
    logger.info(f"Delaunay 3D: {len(t_mesh.vertices)} vertices, {len(t_mesh.faces)} faces")
    return trimesh.Scene(t_mesh)


def _remove_long_edges(mesh, max_ratio=5.0):
    edges = mesh.edges_unique_length
    if len(edges) == 0:
        return
    threshold = np.median(edges) * max_ratio
    face_mask = []
    for face in mesh.faces:
        verts = mesh.vertices[face]
        lens = [
            np.linalg.norm(verts[0] - verts[1]),
            np.linalg.norm(verts[1] - verts[2]),
            np.linalg.norm(verts[2] - verts[0]),
        ]
        face_mask.append(max(lens) <= threshold)
    mesh.update_faces(face_mask)


def _map_colors_to_mesh(pc_vertices, pc_colors, mesh_vertices):
    """Map point cloud colors sang mesh vertices bằng nearest neighbor."""
    from scipy.spatial import cKDTree
    tree = cKDTree(pc_vertices)
    _, indices = tree.query(mesh_vertices)
    return pc_colors[indices]
