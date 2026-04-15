# COLMAP Worker - Hướng dẫn vận hành

## Yêu cầu
- Ubuntu 24.04 với NVIDIA GPU (RTX 30-series, arch 86)
- COLMAP 4.1.0 (build từ source với CUDA 12.0)
- Python 3.12 venv tại `~/roomie/infra/colmap-worker/venv`
- IP Ubuntu: `100.96.78.62`
- IP Windows (property-service): `100.69.114.54`

---

## Setup lần đầu

### Bước 1: Cài COLMAP với CUDA
```bash
# Build dependencies
sudo apt update && sudo apt install -y \
    git cmake ninja-build build-essential \
    libboost-program-options-dev libboost-filesystem-dev \
    libboost-graph-dev libboost-system-dev \
    libeigen3-dev libflann-dev libfreeimage-dev \
    libmetis-dev libgoogle-glog-dev libgtest-dev \
    libsqlite3-dev libglew-dev qtbase5-dev libqt5opengl5-dev \
    libcgal-dev libceres-dev \
    nvidia-cuda-toolkit

# Build COLMAP
git clone https://github.com/colmap/colmap.git /tmp/colmap-build
cd /tmp/colmap-build && mkdir build && cd build
cmake .. -DCMAKE_CUDA_ARCHITECTURES=86 -DCUDA_ENABLED=ON
make -j$(nproc) && sudo make install

# Verify
colmap -h | head -1
# → COLMAP 4.x.x (... with CUDA)
```

### Bước 2: Setup Python environment
```bash
cd ~/roomie/infra/colmap-worker
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Bước 3: Đảm bảo Docker infra đang chạy (MinIO)
```bash
cd ~/roomie/infra
docker compose up -d
```

---

## Sau khi restart máy

### Bước 1: Start Docker infra
```bash
cd ~/roomie/infra
docker compose up -d
```

### Bước 2: Start COLMAP Worker
```bash
~/roomie/infra/colmap-worker/start.sh
```

Worker sẽ chạy tại: `http://0.0.0.0:5000`

---

## Cập nhật file từ Windows

Khi sửa code trên Windows, copy lên Ubuntu bằng SCP:

```powershell
# Từ PowerShell trên Windows
scp "c:\Users\LoiChau\Downloads\roomie\infra\colmap-worker\converter.py" phucloi@100.96.78.62:~/roomie/infra/colmap-worker/converter.py
scp "c:\Users\LoiChau\Downloads\roomie\infra\colmap-worker\pipeline.py" phucloi@100.96.78.62:~/roomie/infra/colmap-worker/pipeline.py
scp "c:\Users\LoiChau\Downloads\roomie\infra\colmap-worker\app.py" phucloi@100.96.78.62:~/roomie/infra/colmap-worker/app.py
scp "c:\Users\LoiChau\Downloads\roomie\infra\colmap-worker\start.sh" phucloi@100.96.78.62:~/roomie/infra/colmap-worker/start.sh
```

Sau khi copy, trên Ubuntu:
```bash
# Cấp quyền chạy cho start.sh (lần đầu)
chmod +x ~/roomie/infra/colmap-worker/start.sh

# Ctrl+C dừng worker cũ, rồi:
~/roomie/infra/colmap-worker/start.sh
```

---

## Kiểm tra

| Service | URL | Mô tả |
|---------|-----|-------|
| COLMAP Worker | http://100.96.78.62:5000/health | Health check |
| n8n | http://100.96.78.62:5678 | Workflow orchestrator |
| MinIO Console | http://100.96.78.62:9001 | Object storage UI (roomie / Lp6tA4wG7yH2mK9xR1fN3cBe) |

```bash
# Test health
curl http://localhost:5000/health

# Test COLMAP có CUDA
colmap -h | head -1
# → COLMAP 4.1.0.dev0 (... with CUDA)
```

---

## API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/reconstruct` | Bắt đầu tạo mô hình 3D |
| GET | `/status/<job_id>` | Kiểm tra tiến trình |
| GET | `/health` | Health check |

### Ví dụ request
```bash
curl -X POST http://localhost:5000/reconstruct \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "abc123",
    "imageUrls": [
      "http://localhost:9000/roomie-files/img1.jpg",
      "http://localhost:9000/roomie-files/img2.jpg",
      "http://localhost:9000/roomie-files/img3.jpg"
    ]
  }'
```

---

## Troubleshooting

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| `Secret key must not be empty` | Chưa export env vars | Dùng `start.sh` thay vì `python app.py` |
| `externally-managed-environment` | pip system-wide | `source ~/roomie/infra/colmap-worker/venv/bin/activate` trước |
| `CUDA not available` | Driver chưa load | `sudo nvidia-smi` kiểm tra |
| `SfM failed: sparse/0 not found` | Ảnh thiếu overlap | Cần 60-80% overlap giữa các ảnh |
| Worker không start | Port 5000 bị chiếm | `lsof -i :5000` rồi kill process |
| `cmake: CUDA not found` | Thiếu CUDA toolkit | `sudo apt install nvidia-cuda-toolkit` |
| `open3d import error` | Thiếu OpenGL libs | `sudo apt install -y libgl1-mesa-glx libgomp1` |

---

## Cấu trúc file

```
infra/colmap-worker/
├── app.py           # Flask API server (POST /reconstruct, GET /status, GET /health)
├── pipeline.py      # COLMAP SfM + Dense/Sparse reconstruction pipeline
├── converter.py     # PLY → GLB converter v4 (4-stage clean, island removal, NN colors)
├── start.sh         # Script khởi động với env vars
├── OPERATIONS.md    # File này
├── Dockerfile       # Docker image (không dùng — chạy native với CUDA)
└── requirements.txt # Python dependencies
```
