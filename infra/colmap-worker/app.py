"""
COLMAP Worker — Flask API for 3D reconstruction from images.
Receives image URLs, runs COLMAP pipeline, exports .glb, uploads to MinIO.
"""

import os
import uuid
import logging
import threading
from flask import Flask, request, jsonify
from pipeline import ColmapPipeline
from minio import Minio

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# MinIO config
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_PUBLIC_ENDPOINT = os.getenv("MINIO_PUBLIC_ENDPOINT", MINIO_ENDPOINT)
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "roomie")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "")
MINIO_BUCKET = os.getenv("MINIO_BUCKET_3D", "roomie-3d-models")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"

# Property service callback
PROPERTY_CALLBACK_URL = os.getenv("PROPERTY_CALLBACK_URL", "http://property-service:8083/property/internal/3d-callback")

# Workspace
WORKSPACE_DIR = os.getenv("WORKSPACE_DIR", "/workspace")

# Track running jobs
jobs = {}

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE
)


def ensure_bucket():
    if not minio_client.bucket_exists(MINIO_BUCKET):
        minio_client.make_bucket(MINIO_BUCKET)
        # Set public read policy
        policy = {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{MINIO_BUCKET}/*"]
            }]
        }
        import json
        minio_client.set_bucket_policy(MINIO_BUCKET, json.dumps(policy))
        logger.info(f"Created bucket: {MINIO_BUCKET}")


def run_reconstruction(job_id, property_id, image_urls):
    """Background thread: download images → COLMAP → export GLB → upload MinIO → callback"""
    import requests as req

    try:
        jobs[job_id]["status"] = "downloading"
        logger.info(f"[{job_id}] Downloading {len(image_urls)} images...")

        # Create workspace
        job_dir = os.path.join(WORKSPACE_DIR, job_id)
        images_dir = os.path.join(job_dir, "images")
        os.makedirs(images_dir, exist_ok=True)

        # Download images
        for i, url in enumerate(image_urls):
            ext = url.rsplit(".", 1)[-1] if "." in url.split("/")[-1] else "jpg"
            img_path = os.path.join(images_dir, f"img_{i:04d}.{ext}")
            resp = req.get(url, timeout=60)
            resp.raise_for_status()
            with open(img_path, "wb") as f:
                f.write(resp.content)

        logger.info(f"[{job_id}] Downloaded {len(image_urls)} images")

        # Run COLMAP pipeline
        jobs[job_id]["status"] = "reconstructing"
        pipeline = ColmapPipeline(job_dir)
        glb_path = pipeline.run(images_dir)

        if not glb_path or not os.path.exists(glb_path):
            raise RuntimeError("COLMAP pipeline failed to produce output")

        # Upload to MinIO
        jobs[job_id]["status"] = "uploading"
        object_name = f"{property_id}/{property_id}.glb"
        minio_client.fput_object(
            MINIO_BUCKET,
            object_name,
            glb_path,
            content_type="model/gltf-binary"
        )

        # Build public URL
        model_url = f"http://{MINIO_PUBLIC_ENDPOINT}/{MINIO_BUCKET}/{object_name}"
        if MINIO_SECURE:
            model_url = f"https://{MINIO_PUBLIC_ENDPOINT}/{MINIO_BUCKET}/{object_name}"

        logger.info(f"[{job_id}] Uploaded model to MinIO: {model_url}")

        # Callback to property-service
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["model_url"] = model_url

        req.post(PROPERTY_CALLBACK_URL, json={
            "propertyId": property_id,
            "model3dUrl": model_url,
            "status": "COMPLETED"
        }, timeout=10)

        logger.info(f"[{job_id}] Callback sent. Reconstruction complete!")

    except Exception as e:
        logger.error(f"[{job_id}] Reconstruction failed: {e}")
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)

        try:
            req.post(PROPERTY_CALLBACK_URL, json={
                "propertyId": property_id,
                "status": "FAILED",
                "errorMessage": str(e)
            }, timeout=10)
        except Exception:
            logger.error(f"[{job_id}] Failed to send error callback")

    finally:
        # Cleanup workspace
        import shutil
        job_dir = os.path.join(WORKSPACE_DIR, job_id)
        if os.path.exists(job_dir):
            shutil.rmtree(job_dir, ignore_errors=True)


@app.route("/reconstruct", methods=["POST"])
def reconstruct():
    data = request.get_json()

    property_id = data.get("propertyId")
    image_urls = data.get("imageUrls", [])

    if not property_id or len(image_urls) < 3:
        return jsonify({"error": "propertyId and at least 3 imageUrls required"}), 400

    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "queued",
        "propertyId": property_id,
        "imageCount": len(image_urls)
    }

    thread = threading.Thread(target=run_reconstruction, args=(job_id, property_id, image_urls))
    thread.daemon = True
    thread.start()

    return jsonify({"jobId": job_id, "status": "queued"}), 202


@app.route("/status/<job_id>", methods=["GET"])
def get_status(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "activeJobs": len([j for j in jobs.values() if j["status"] not in ("completed", "failed")])}), 200


if __name__ == "__main__":
    ensure_bucket()
    app.run(host="0.0.0.0", port=5000, debug=False)
