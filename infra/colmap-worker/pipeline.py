"""
COLMAP reconstruction pipeline.
Runs SfM + (optional Dense reconstruction) + Meshing + GLB export.
Falls back to sparse-only when CUDA is not available.
"""

import os
import subprocess
import logging

logger = logging.getLogger(__name__)


def has_cuda():
    try:
        result = subprocess.run(
            ["colmap", "patch_match_stereo", "--help"],
            capture_output=True, text=True, timeout=10
        )
        return "requires CUDA" not in result.stderr
    except Exception:
        return False


CUDA_AVAILABLE = has_cuda()
logger.info(f"CUDA available for COLMAP: {CUDA_AVAILABLE}")


class ColmapPipeline:
    def __init__(self, workspace_dir):
        self.workspace = workspace_dir
        self.database_path = os.path.join(workspace_dir, "database.db")
        self.sparse_dir = os.path.join(workspace_dir, "sparse")
        self.dense_dir = os.path.join(workspace_dir, "dense")
        self.mesh_dir = os.path.join(workspace_dir, "mesh")

    def run(self, images_dir):
        os.makedirs(self.sparse_dir, exist_ok=True)
        os.makedirs(self.dense_dir, exist_ok=True)
        os.makedirs(self.mesh_dir, exist_ok=True)

        self._downscale_images(images_dir, max_size=1600)

        use_gpu = "1" if CUDA_AVAILABLE else "0"

        logger.info("Step 1: Feature extraction...")
        self._feature_extractor(images_dir, use_gpu)

        logger.info("Step 2: Feature matching...")
        n_images = len([
            f for f in os.listdir(images_dir)
            if os.path.isfile(os.path.join(images_dir, f))
            and f.lower().endswith(('.jpg', '.jpeg', '.png'))
        ])
        if n_images <= 100:
            self._exhaustive_matcher(use_gpu)
        else:
            self._vocab_tree_matcher(use_gpu)

        logger.info("Step 3: Sparse reconstruction (SfM)...")
        self._mapper(images_dir)

        sparse_model = os.path.join(self.sparse_dir, "0")
        if not os.path.exists(sparse_model):
            raise RuntimeError(
                "SfM failed: sparse/0 not found. "
                "Ensure images have 60-80% overlap."
            )

        if CUDA_AVAILABLE:
            return self._dense_path(images_dir, sparse_model)
        else:
            logger.info("CUDA not available — using sparse-to-mesh path")
            return self._sparse_path(sparse_model)

    # ─────────────────────────────────────────────
    # Dense path (CUDA)
    # ─────────────────────────────────────────────
    def _dense_path(self, images_dir, sparse_model):
        logger.info("Step 4: Image undistortion...")
        self._image_undistorter(images_dir)

        logger.info("Step 5: Dense reconstruction (PatchMatch)...")
        self._patch_match_stereo()

        logger.info("Step 6: Stereo fusion...")
        self._stereo_fusion()

        fused_ply = os.path.join(self.dense_dir, "fused.ply")
        if not os.path.exists(fused_ply):
            raise RuntimeError("Fused point cloud not found")

        n_pts = self._count_ply_points(fused_ply)
        logger.info(f"Fused point cloud: {n_pts} points")

        logger.info("Step 7: Filter noise from point cloud...")
        filtered_ply = os.path.join(self.mesh_dir, "filtered.ply")
        self._filter_point_cloud(fused_ply, filtered_ply)

        logger.info("Step 8: Mesh + export GLB with Open3D...")
        from converter import mesh_to_glb
        glb_path = os.path.join(self.mesh_dir, "model.glb")
        mesh_to_glb(filtered_ply, glb_path)
        return glb_path

    # ─────────────────────────────────────────────
    # Sparse path (CPU fallback)
    # ─────────────────────────────────────────────
    def _sparse_path(self, sparse_model):
        logger.info("Step 4: Export sparse model to PLY...")
        sparse_ply = os.path.join(self.mesh_dir, "sparse.ply")

        self._run_colmap([
            "model_converter",
            "--input_path", sparse_model,
            "--output_path", sparse_ply,
            "--output_type", "PLY",
        ])

        if not os.path.exists(sparse_ply):
            raise RuntimeError("Failed to export sparse model to PLY")

        n_points = self._count_ply_points(sparse_ply)
        logger.info(f"Sparse PLY: {n_points} points")

        if n_points < 100:
            raise RuntimeError(
                f"Sparse point cloud too few ({n_points} points). "
                "Check image overlap."
            )

        logger.info("Step 5: Convert sparse PLY to GLB...")
        from converter import mesh_to_glb
        glb_path = os.path.join(self.mesh_dir, "model.glb")
        mesh_to_glb(sparse_ply, glb_path)
        return glb_path

    # ─────────────────────────────────────────────
    # Point cloud noise filtering
    # ─────────────────────────────────────────────
    def _filter_point_cloud(self, input_ply, output_ply):
        """Filter noise from dense point cloud before meshing."""
        try:
            import open3d as o3d

            logger.info(f"Loading {input_ply} for filtering...")
            pcd = o3d.io.read_point_cloud(input_ply)
            n_before = len(pcd.points)
            logger.info(f"Points before filter: {n_before}")

            pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)
            logger.info(f"After statistical filter: {len(pcd.points)}")

            pcd, _ = pcd.remove_radius_outlier(nb_points=10, radius=0.05)
            logger.info(f"After radius filter: {len(pcd.points)}")

            if len(pcd.points) > 3_000_000:
                pcd = pcd.voxel_down_sample(voxel_size=0.005)
                logger.info(f"Downsampled to {len(pcd.points)} points")

            o3d.io.write_point_cloud(output_ply, pcd)
            logger.info(f"Filtered PLY saved: {output_ply}")

        except ImportError:
            logger.warning("open3d not available — using unfiltered point cloud")
            import shutil
            shutil.copy(input_ply, output_ply)

    # ─────────────────────────────────────────────
    # Helpers
    # ─────────────────────────────────────────────
    def _count_ply_points(self, ply_path):
        try:
            with open(ply_path, 'rb') as f:
                for line in f:
                    line = line.decode('ascii', errors='ignore').strip()
                    if line.startswith('element vertex'):
                        return int(line.split()[-1])
            return 0
        except Exception:
            return 0

    def _downscale_images(self, images_dir, max_size=1600):
        try:
            from PIL import Image
            for fname in os.listdir(images_dir):
                fpath = os.path.join(images_dir, fname)
                if not os.path.isfile(fpath):
                    continue
                if not fname.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.tiff')):
                    continue
                try:
                    img = Image.open(fpath)
                    w, h = img.size
                    if max(w, h) > max_size:
                        ratio = max_size / max(w, h)
                        new_size = (int(w * ratio), int(h * ratio))
                        img = img.resize(new_size, Image.LANCZOS)
                        img.save(fpath, quality=95)
                        logger.info(f"Resized {fname}: {w}x{h} -> {new_size[0]}x{new_size[1]}")
                    img.close()
                except Exception as e:
                    logger.warning(f"Could not resize {fname}: {e}")
        except ImportError:
            logger.warning("Pillow not installed — skipping image downscale")

    def _run_colmap(self, args, timeout=1800):
        cmd = ["colmap"] + args
        logger.info(f"Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        if result.returncode != 0:
            logger.error(f"COLMAP stderr: {result.stderr[-1000:]}")
            raise RuntimeError(f"COLMAP failed ({args[0]}): {result.stderr[-500:]}")
        return result

    def _feature_extractor(self, images_dir, use_gpu="0"):
        self._run_colmap([
            "feature_extractor",
            "--database_path", self.database_path,
            "--image_path", images_dir,
            "--ImageReader.single_camera", "1",
            "--SiftExtraction.use_gpu", use_gpu,
            "--SiftExtraction.max_num_features", "8192",
            "--SiftExtraction.max_image_size", "1600",
        ])

    def _exhaustive_matcher(self, use_gpu="0"):
        self._run_colmap([
            "exhaustive_matcher",
            "--database_path", self.database_path,
            "--SiftMatching.use_gpu", use_gpu,
            "--SiftMatching.max_num_matches", "32768",
        ])

    def _vocab_tree_matcher(self, use_gpu="0"):
        vocab_tree_path = "/opt/vocab_tree.bin"
        if not os.path.exists(vocab_tree_path):
            logger.warning("Vocab tree not found, falling back to exhaustive_matcher")
            self._exhaustive_matcher(use_gpu)
            return
        self._run_colmap([
            "vocab_tree_matcher",
            "--database_path", self.database_path,
            "--SiftMatching.use_gpu", use_gpu,
            "--VocabTreeMatching.vocab_tree_path", vocab_tree_path,
        ])

    def _mapper(self, images_dir):
        self._run_colmap([
            "mapper",
            "--database_path", self.database_path,
            "--image_path", images_dir,
            "--output_path", self.sparse_dir,
            "--Mapper.min_num_matches", "15",
            "--Mapper.ba_global_max_num_iterations", "50",
            "--Mapper.ba_global_max_refinements", "3",
            "--Mapper.init_min_num_inliers", "50",
        ])

    def _image_undistorter(self, images_dir):
        self._run_colmap([
            "image_undistorter",
            "--image_path", images_dir,
            "--input_path", os.path.join(self.sparse_dir, "0"),
            "--output_path", self.dense_dir,
            "--output_type", "COLMAP",
            "--max_image_size", "1600",
        ])

    def _patch_match_stereo(self):
        self._run_colmap([
            "patch_match_stereo",
            "--workspace_path", self.dense_dir,
            "--workspace_format", "COLMAP",
            "--PatchMatchStereo.geom_consistency", "true",
            "--PatchMatchStereo.gpu_index", "0",
            "--PatchMatchStereo.window_radius", "7",
        ])

    def _stereo_fusion(self):
        self._run_colmap([
            "stereo_fusion",
            "--workspace_path", self.dense_dir,
            "--workspace_format", "COLMAP",
            "--input_type", "geometric",
            "--output_path", os.path.join(self.dense_dir, "fused.ply"),
            "--StereoFusion.min_num_pixels", "3",
            "--StereoFusion.max_reproj_error", "2",
        ])
