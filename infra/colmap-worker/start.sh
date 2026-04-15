#!/bin/bash
# ============================================
# COLMAP Worker Startup Script
# Chạy trên Ubuntu server (có CUDA + COLMAP)
# ============================================

# Activate Python virtual environment
source ~/roomie/infra/colmap-worker/venv/bin/activate

# MinIO credentials (lấy từ infra/.env)
export MINIO_ENDPOINT="localhost:9000"
export MINIO_PUBLIC_ENDPOINT="100.96.78.62:9000"
export MINIO_ACCESS_KEY="roomie"
export MINIO_SECRET_KEY="Lp6tA4wG7yH2mK9xR1fN3cBe"
export MINIO_BUCKET_3D="roomie-3d-models"

# Property service callback URL (Windows machine)
export PROPERTY_CALLBACK_URL="http://100.69.114.54:8083/property/internal/3d-callback"

# Workspace cho temp files
export WORKSPACE_DIR="/tmp/colmap-workspace"

# Chạy Flask worker
cd ~/roomie/infra/colmap-worker
python app.py
