# Tài liệu kỹ thuật — Tính năng Tái tạo Mô hình 3D

## Tổng quan

Tính năng cho phép chủ phòng trọ tạo mô hình 3D từ ảnh chụp phòng, sử dụng công nghệ photogrammetry (COLMAP). Quy trình hoàn toàn tự động: chủ nhà upload ảnh → hệ thống tái tạo 3D → hiển thị mô hình trên trang chi tiết.

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          WINDOWS (Development)                             │
│                                                                            │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │  React Frontend  │    │ Property Service │    │ Other Spring Boot    │  │
│  │    :3000         │───▶│    :8083         │    │ Services             │  │
│  └──────────────────┘    └────────┬─────────┘    └──────────────────────┘  │
│                                   │                                        │
└───────────────────────────────────┼────────────────────────────────────────┘
                                    │ Tailscale (100.69.114.54 ↔ 100.96.78.62)
┌───────────────────────────────────┼────────────────────────────────────────┐
│                          UBUNTU SERVER                                     │
│                                   │                                        │
│  ┌────────────────────────────────▼─────────────────────────────────────┐  │
│  │                     Docker Compose                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │  │
│  │  │  MinIO   │  │  MongoDB │  │  Redis   │  │       n8n          │  │  │
│  │  │  :9000   │  │  :27017  │  │  :6379   │  │      :5678         │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┬──────────┘  │  │
│  └──────────────────────────────────────────────────────┼──────────────┘  │
│                                                          │                 │
│  ┌───────────────────────────────────────────────────────▼──────────────┐  │
│  │                    COLMAP Worker (Host)                              │  │
│  │                        :5000                                        │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐                  │  │
│  │  │  app.py  │  │ pipeline.py  │  │ converter.py │                  │  │
│  │  │ Flask API│  │ COLMAP SfM   │  │ PLY → GLB    │                  │  │
│  │  └──────────┘  └──────────────┘  └──────────────┘                  │  │
│  │                                                                     │  │
│  │  GPU: NVIDIA RTX 3050 (4GB) — CUDA 12.8                           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Luồng xử lý (Flow)

```
1. Chủ nhà nhấn "Tạo mô hình 3D" trên frontend
       │
2. Frontend gọi POST /property/{id}/3d-model
       │
3. Property Service:
   ├── Set model3dStatus = "PROCESSING"
   ├── Lấy danh sách imageUrls từ mediaList
   └── Gọi n8n webhook: POST http://ubuntu:5678/webhook/3d-reconstruct
       │
4. n8n workflow nhận request, forward đến COLMAP Worker:
   POST http://172.18.0.1:5000/reconstruct
       │
5. COLMAP Worker (background thread):
    ├── Download ảnh từ MinIO
    ├── Downscale ảnh (max 1200px)
    ├── COLMAP Feature Extraction (SIFT, GPU)
    ├── COLMAP Feature Matching (Exhaustive, GPU)
    ├── COLMAP Sparse Reconstruction (SfM)
    ├── [Nếu có CUDA] Dense Reconstruction (PatchMatch → Fusion)
    ├── Point Cloud Noise Filtering (Open3D — statistical + radius)
    ├── 4-Stage Point Cloud Cleaning (statistical → radius → DBSCAN → 2nd statistical)
    ├── Surface Reconstruction (Poisson depth=7-8 / Ball Pivoting / Delaunay)
    ├── Post-Mesh Island Removal (loại debris)
    ├── GLB Export + Material Injection (doubleSided PBR)
    ├── Upload .glb → MinIO (bucket: roomie-3d-models)
    └── Callback POST → Property Service /internal/3d-callback
       │
6. Property Service:
   ├── Set model3dUrl = "http://minio/roomie-3d-models/{id}/{id}.glb"
   ├── Set model3dStatus = "COMPLETED"
   └── Set model3dCompletedAt = now()
       │
7. Frontend hiển thị mô hình 3D qua <model-viewer> (Google)
```

---

## Thành phần chi tiết

### 1. COLMAP Worker (`infra/colmap-worker/`)

Flask API server chạy trên Ubuntu host (không Docker).

| File | Vai trò |
|---|---|
| `app.py` | Flask API: `/reconstruct`, `/status/{id}`, `/health` |
| `pipeline.py` | COLMAP pipeline: SfM, Dense/Sparse path |
| `converter.py` | PLY → GLB: Poisson mesh, color mapping, material injection |
| `requirements.txt` | Python dependencies |

#### API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/reconstruct` | Bắt đầu reconstruction job |
| `GET` | `/status/{jobId}` | Kiểm tra trạng thái job |
| `GET` | `/health` | Health check |

#### POST /reconstruct — Request Body
```json
{
  "propertyId": "69d41a65e349b0663c48038b",
  "imageUrls": [
    "http://100.96.78.62:9000/roomie/property/img1.jpg",
    "http://100.96.78.62:9000/roomie/property/img2.jpg"
  ]
}
```

#### POST /reconstruct — Response (202 Accepted)
```json
{
  "jobId": "a9889d36-add6-4fb2-ade6-3c64e5ade30d",
  "status": "queued"
}
```

#### Environment Variables
```bash
MINIO_ENDPOINT="localhost:9000"           # MinIO internal
MINIO_PUBLIC_ENDPOINT="100.96.78.62:9000" # MinIO public URL (cho GLB access)
MINIO_ACCESS_KEY="roomie"
MINIO_SECRET_KEY="<secret>"
MINIO_BUCKET_3D="roomie-3d-models"
PROPERTY_CALLBACK_URL="http://100.69.114.54:8083/property/internal/3d-callback"
```

### 2. Pipeline xử lý (`pipeline.py`)

Hai đường chạy tùy thuộc có GPU hay không:

| | Sparse Path (CPU) | Dense Path (CUDA GPU) |
|---|---|---|
| **Khi nào** | Không có CUDA | Có NVIDIA GPU + CUDA |
| **Số điểm 3D** | ~100K | Hàng triệu |
| **Chất lượng** | Trung bình | Cao |
| **Thời gian** | ~30-45 phút | ~15-25 phút |
| **Bước xử lý** | Extract → Match → SfM → Export PLY → GLB | Extract → Match → SfM → Undistort → PatchMatch → Fusion → GLB |

### 3. Converter (`converter.py` v4)

Chuyển đổi point cloud PLY thành GLB mesh với các fix quan trọng:

| Fix | Mô tả |
|---|---|
| Y-axis flip | COLMAP dùng Y-down, WebGL dùng Y-up → đảo Y |
| GLB Material Injection | Inject PBR material (doubleSided) để three.js render vertex colors |
| Nearest-Neighbor Color | Map màu từ point cloud sang mesh vertex bằng KD-Tree |
| 4-Stage Cleaning | Statistical → Radius → DBSCAN (keep largest) → 2nd Statistical |
| Normal Estimation | Camera-above-centroid heuristic + outward orientation check |
| Post-Mesh Island Removal | Loại mesh islands nhỏ (< 5% of largest) — fix floating debris |
| Poisson Depth | depth=8 (>50K pts) hoặc 7 — safe cho 12GB RAM |
| Outward Normals | Đảm bảo normal hướng ra ngoài (không bị inside-out) |

**Fallback chain**: Poisson → Ball Pivoting → Delaunay → Convex Hull

### 4. n8n Workflow

Vai trò: **trigger** và **monitor** (COLMAP Worker tự xử lý callback).

#### Workflow đơn giản (2 nodes):
```
[Webhook: POST /webhook/3d-reconstruct]
    │
    ▼
[HTTP Request: POST http://172.18.0.1:5000/reconstruct]
```

#### Workflow đầy đủ (có monitor):
```
[Webhook] → [HTTP: COLMAP Worker] → [Wait 30s] → [HTTP: Check Status] → [IF Complete?]
                                          ↑                                    │ NO
                                          └────────────────────────────────────┘
                                                                               │ YES
                                                                          [Done/Notify]
```

### 5. Frontend Components

| Component | Vai trò |
|---|---|
| `Model3DSection.jsx` | Section trên trang detail: hiển thị trạng thái (Processing/Failed/Completed) |
| `Model3DViewer.jsx` | Render GLB bằng Google `<model-viewer>` (auto-rotate, orbit controls) |
| `Step4Media.jsx` | Trang edit property: nút "Tạo mô hình 3D", toggle visibility |

### 6. Backend — Property Service

#### Entity Fields
```java
String model3dUrl;        // URL của file .glb trên MinIO
String model3dStatus;     // NONE, PROCESSING, COMPLETED, FAILED
Boolean model3dVisible;   // Có hiển thị cho người xem không
Instant model3dRequestedAt;
Instant model3dCompletedAt;
```

#### Internal API (callback từ COLMAP Worker)
```
POST /property/internal/3d-callback
{
  "propertyId": "...",
  "model3dUrl": "http://minio/roomie-3d-models/.../model.glb",
  "status": "COMPLETED"
}
```

---

## Cài đặt & Triển khai

### Yêu cầu hệ thống
- Ubuntu 22.04+ với NVIDIA GPU (khuyến nghị)
- Python 3.12+
- COLMAP (build với CUDA nếu có GPU)
- Docker Compose (cho MinIO, n8n, databases)

### Cài đặt trên Ubuntu
```bash
# 1. Cài COLMAP (CUDA)
sudo apt install -y nvidia-cuda-toolkit
git clone https://github.com/colmap/colmap.git /tmp/colmap-build
cd /tmp/colmap-build && mkdir build && cd build
cmake .. -DCMAKE_CUDA_ARCHITECTURES=86 -DCUDA_ENABLED=ON
make -j$(nproc) && sudo make install

# 2. Setup Python environment
cd ~/roomie/infra/colmap-worker
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Chạy service
export MINIO_ENDPOINT="localhost:9000"
export MINIO_PUBLIC_ENDPOINT="100.96.78.62:9000"
export MINIO_ACCESS_KEY="roomie"
export MINIO_SECRET_KEY="<secret>"
export MINIO_BUCKET_3D="roomie-3d-models"
export PROPERTY_CALLBACK_URL="http://100.69.114.54:8083/property/internal/3d-callback"
python3 app.py
```

### Chạy nền (production)
```bash
nohup python3 app.py > /tmp/colmap-worker.log 2>&1 &
```

Hoặc tạo systemd service:
```ini
# /etc/systemd/system/colmap-worker.service
[Unit]
Description=COLMAP 3D Reconstruction Worker
After=network.target

[Service]
Type=simple
User=phucloi
WorkingDirectory=/home/phucloi/roomie/infra/colmap-worker
Environment="MINIO_ENDPOINT=localhost:9000"
Environment="MINIO_PUBLIC_ENDPOINT=100.96.78.62:9000"
Environment="MINIO_ACCESS_KEY=roomie"
Environment="MINIO_SECRET_KEY=<secret>"
Environment="MINIO_BUCKET_3D=roomie-3d-models"
Environment="PROPERTY_CALLBACK_URL=http://100.69.114.54:8083/property/internal/3d-callback"
ExecStart=/home/phucloi/roomie/infra/colmap-worker/venv/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|---|---|---|
| Model trắng (không màu) | GLB thiếu PBR material | converter.py v3 đã fix bằng `_inject_vertex_color_material()` |
| Model lộn ngược | COLMAP Y-down ≠ WebGL Y-up | converter.py v3 đã fix bằng Y-axis flip |
| Mảnh rời bay xung quanh | Noise trong point cloud | DBSCAN clustering giữ cluster lớn nhất |
| Callback refused | Property Service IP sai | Kiểm tra `PROPERTY_CALLBACK_URL` (Tailscale IP) |
| SfM failed: sparse/0 not found | Ảnh không đủ overlap | Cần ≥8 ảnh với 60-80% overlap |
| Model quá thô | Dùng sparse path (không GPU) | Cài CUDA-enabled COLMAP |
| Loading kẹt trên frontend | model-viewer chưa load xong | Model3DViewer.jsx dùng event `load` để ẩn overlay |

---

## Hướng dẫn chụp ảnh tốt

1. **Số lượng**: Tối thiểu 8, khuyến nghị 15-30 ảnh
2. **Góc chụp**: Xoay quanh phòng/tòa nhà, mỗi ảnh overlap 60-80%
3. **Chất lượng**: Ảnh rõ nét, không bị mờ/rung
4. **Ánh sáng**: Đều, tránh ngược sáng
5. **Tránh**: Gương, kính phản chiếu, vật di chuyển (người, xe)
