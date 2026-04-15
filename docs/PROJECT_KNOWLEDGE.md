# Roomie — Tổng Hợp Kiến Thức Dự Án

> Tài liệu toàn diện cho phỏng vấn & demo dự án.
> Cập nhật: 2026-04-07

---

## Mục Lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Chi tiết từng Microservice](#3-chi-tiết-từng-microservice)
4. [COLMAP 3D Reconstruction Worker](#4-colmap-3d-reconstruction-worker)
5. [Database & Data Model](#5-database--data-model)
6. [Luồng xử lý chính (Business Flows)](#6-luồng-xử-lý-chính)
7. [Bảo mật & Authentication](#7-bảo-mật--authentication)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Giao tiếp giữa các service](#9-giao-tiếp-giữa-các-service)
10. [Infrastructure & DevOps](#10-infrastructure--devops)
11. [Các pattern & công nghệ cần nắm](#11-các-pattern--công-nghệ-cần-nắm)
12. [Câu hỏi phỏng vấn thường gặp](#12-câu-hỏi-phỏng-vấn-thường-gặp)
13. [Demo Script](#13-demo-script)

---

## 1. Tổng Quan Dự Án

### Roomie là gì?

Roomie là **nền tảng quản lý cho thuê nhà/phòng trọ** (Rental Property Management Platform) xây dựng theo kiến trúc **microservices**, phục vụ 3 nhóm người dùng chính:

| Vai trò | Mô tả | Chức năng chính |
|---|---|---|
| **Tenant** (Người thuê) | Tìm kiếm, đặt phòng, ký hợp đồng, thanh toán | Tìm phòng, booking, ký hợp đồng online, thanh toán hóa đơn |
| **Landlord** (Chủ trọ) | Đăng bài, quản lý phòng, tạo hóa đơn | Đăng tin, quản lý hợp đồng, xuất hóa đơn, thu tiền |
| **Admin** (Quản trị) | Duyệt bài, quản lý người dùng, giám sát hệ thống | Duyệt tin đăng, ban user, xem log hệ thống |

### Tech Stack

| Tầng | Công nghệ | Phiên bản |
|---|---|---|
| **Backend** | Java, Spring Boot | Java 21, Spring Boot 3.2.5 |
| **Frontend** | React, MUI, Tailwind CSS | React 19.2, MUI v7.3, Tailwind v3.4 |
| **Build Tool (FE)** | Vite (migrated from CRA) | Vite 7.1 |
| **Relational DB** | MySQL | 8.0 |
| **Document DB** | MongoDB | 7.0 |
| **Graph DB** | Neo4j | 5.15 |
| **Cache** | Redis | 7.2 |
| **Search Engine** | Elasticsearch | 8.11 |
| **Message Broker** | Apache Kafka | Confluent 7.5 |
| **Object Storage** | MinIO | S3-compatible |
| **3D Reconstruction** | COLMAP + Open3D + Trimesh | Python Flask worker |
| **Maps** | Leaflet + Google Maps API | react-leaflet v5, @googlemaps/markerclusterer |
| **3D Viewer** | Google Model Viewer | @google/model-viewer v4.2 |
| **Charts** | Recharts | v3.6 |
| **Service Discovery** | Eureka | via Docker |
| **Monitoring** | Prometheus | v2.47 |
| **Containerization** | Docker Compose | — |

### Quy mô dự án

- **13 microservices** backend (Java Spring Boot)
- **1 Python worker** (COLMAP 3D reconstruction)
- **1 React SPA** frontend (~300 JSX/JS files)
- **11 infrastructure services** (Docker Compose)
- **~60+ REST API endpoints**
- **27 frontend service files** (API layer)
- **9 React Contexts**, **8 custom hooks folders**
- **Hỗ trợ đa ngôn ngữ** (i18n: Tiếng Việt + English)

---

## 2. Kiến Trúc Hệ Thống

### 2.1 Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                   │
│     MUI v7 + Tailwind CSS + Vite 7 + React Router v7    │
│        Leaflet Maps + Model Viewer + Recharts            │
│                   http://localhost:3000                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (REST API)
                       ▼
┌──────────────────────────────────────────────────────────┐
│              API GATEWAY (Spring Cloud Gateway)          │
│              Port 8888 — /api/v1/*                       │
│         AuthenticationFilter (JWT introspect)            │
└──────┬───┬───┬───┬───┬───┬───┬───┬───┬───┬──────────────┘
       │   │   │   │   │   │   │   │   │   │
       ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
  ┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐
  │IDENT││ADMIN││PROFL││PRPTY││BOOK ││CONTR││BILL │ ...
  │8080 ││8081 ││8082 ││8083 ││8084 ││8085 ││8086 │
  └──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘
     │      │      │      │      │      │      │
     ▼      ▼      ▼      ▼      ▼      ▼      ▼
┌──────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                     │
│  MySQL │ MongoDB │ Neo4j │ Redis │ Elasticsearch │ Kafka │
│  MinIO │ Prometheus │ Eureka │ Zookeeper │ COLMAP Worker │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Service Map

| Service | Port | Context Path | Database Dependencies |
|---|---|---|---|
| api-gateway | 8888 | (none) | — |
| identity-service | 8080 | /identity | MySQL + Redis + Kafka |
| admin-service | 8081 | /admin | MongoDB + Redis + Elasticsearch + Kafka |
| profile-service | 8082 | /profile | MongoDB + Redis + Neo4j + Kafka |
| property-service | 8083 | /property | MongoDB + Redis + Elasticsearch |
| booking-service | 8084 | /booking | MongoDB + Redis + Kafka |
| contract-service | 8085 | /contract | MongoDB + Redis + Kafka |
| billing-service | 8086 | /billing | MongoDB + Redis + Kafka |
| payment-service | 8087 | /payment | MongoDB + Redis + Kafka |
| file-service | 8088 | /file | MongoDB + Redis + MinIO |
| chat-service | 8089 | /chat | MongoDB + Redis |
| notification-service | 8090 | /notification | MongoDB + Kafka |
| ai-service | 8091 | /ai | MongoDB |
| **colmap-worker** | **5000** | **/reconstruct** | **MinIO (Python Flask)** |

### 2.3 Gateway Routing

Routed qua API Gateway (`/api/v1/*`):
- identity, admin, profile, property, booking, contract, billing, payment, file, chat

**Chưa route qua gateway:**
- notification-service (truy cập trực tiếp port 8090)
- ai-service (truy cập trực tiếp port 8091)

### 2.4 Tại sao dùng Microservices?

| Lý do | Giải thích |
|---|---|
| **Separation of Concerns** | Mỗi service chịu trách nhiệm 1 bounded context |
| **Independent Deployment** | Có thể deploy riêng từng service khi update |
| **Tech Diversity** | identity dùng MySQL (relational), còn lại dùng MongoDB (document), COLMAP worker dùng Python |
| **Scalability** | Có thể scale riêng property-service khi traffic tìm kiếm cao |
| **Team Independence** | Nhiều dev có thể làm việc song song trên các service khác nhau |

---

## 3. Chi Tiết Từng Microservice

### 3.1 API Gateway (Port 8888)

**Vai trò:** Entry point duy nhất cho mọi request từ Frontend.

**Chức năng:**
- **Routing:** Điều hướng request tới đúng service dựa trên path prefix (`/api/v1/identity/**` → identity-service)
- **Authentication Filter:** Kiểm tra JWT token hợp lệ trước khi cho request đi tiếp
- **Public Endpoints:** Cho phép truy cập không cần token (login, register, xem property công khai)

**Công nghệ:** Spring Cloud Gateway (reactive, non-blocking dựa trên WebFlux)

**Lý thuyết cần nắm:**
- Gateway Pattern trong microservices
- GlobalFilter & route predicate
- WebFlux reactive programming (`Mono`, `Flux`)

---

### 3.2 Identity Service (Port 8080)

**Vai trò:** Quản lý danh tính và xác thực người dùng.

**Entities:** `User`, `Role`, `Permission`, `InvalidatedToken`, `PasswordResetToken`

**Chức năng chính:**
- Đăng ký / Đăng nhập (username + password)
- OAuth2 Social Login (Google, Facebook)
- JWT Token phát hành và introspect
- Quản lý Role & Permission (RBAC)
- OTP qua email, quên mật khẩu
- Rate Limiting (login: 5 lần/15 phút, register: 3 lần/giờ)

**Database:** MySQL (quan hệ User ↔ Role ↔ Permission cần JOIN → relational DB phù hợp)

**Kafka Events:** `user-events`, `auth-events` (notify các service khác khi user tạo mới)

---

### 3.3 Profile Service (Port 8082)

**Vai trò:** Quản lý thông tin cá nhân mở rộng của user.

**Entity:** `UserProfile` (lưu trên **Neo4j** — graph database)

**Chức năng chính:**
- CRUD hồ sơ người dùng (avatar, họ tên, ngày sinh, giới tính)
- Quét CCCD/CMND qua QR code (`IDCardQRService`)
- Xác minh danh tính (ID card number, permanent address)
- Liên kết mối quan hệ user (Neo4j graph — chủ trọ ↔ người thuê)

**Tại sao dùng Neo4j?** Để model mối quan hệ giữa chủ trọ và người thuê (relationship graph).

**Kafka Consumer:** Lắng nghe `user-events` để tự động tạo profile khi user mới đăng ký.

---

### 3.4 Property Service (Port 8083)

**Vai trò:** Quản lý thông tin bất động sản/phòng trọ.

**Entities:** `Property`, `Address`, `Amenities`, `Media`, `Owner`, `Favorite`

**Chức năng chính:**
- CRUD thông tin phòng trọ (tiêu đề, mô tả, giá, diện tích, tiện nghi)
- Tìm kiếm toàn văn (full-text search) qua Elasticsearch
- **Geo-search:** Tìm phòng theo vị trí gần (nearby search dựa trên tọa độ GPS)
- Tìm theo giá, tỉnh thành, loại phòng
- Gắn label (Hot, Mới đăng)
- Quản lý danh sách yêu thích (Favorites)
- Duyệt/Từ chối (Approval workflow)
- **3D Reconstruction callback:** Nhận kết quả từ COLMAP worker → lưu `model3dUrl` vào property
- **Internal API:** `POST /property/internal/3d-callback` — endpoint nội bộ cho COLMAP worker callback

**Enums quan trọng:**
- `PropertyType`: ROOM, APARTMENT, HOUSE...
- `PropertyStatus`: AVAILABLE, RENTED, MAINTENANCE
- `ApprovalStatus`: PENDING, APPROVED, REJECTED
- `PropertyLabel`: HOT, NEW, RECOMMENDED

**Tại sao dùng Elasticsearch?** Full-text search tiếng Việt, fuzzy matching, geo-search (tọa độ GPS). MongoDB text index không hỗ trợ geo-search mạnh bằng.

---

### 3.5 Booking Service (Port 8084)

**Vai trò:** Quản lý đặt phòng dài hạn.

**Entity:** `LeaseLongTerm`

**Chức năng chính:**
- Tạo booking (tenant đặt phòng)
- Landlord approve/reject booking
- Redis distributed lock (tránh double booking)
- Publish Kafka events khi booking thay đổi trạng thái
- **Auto-generate deposit bill:** Khi contract được ký → tự động tạo hóa đơn tiền cọc

**Enums:** `LeaseStatus`: PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED, COMPLETED

---

### 3.6 Contract Service (Port 8085)

**Vai trò:** Quản lý hợp đồng thuê phòng.

**Entities:** `Contract`, `OTPVerification`

**Chức năng chính:**
- Tạo hợp đồng từ booking approved
- Ký hợp đồng điện tử (Digital Signature) với OTP verification
- Sinh PDF hợp đồng (`ContractPdfGenerator`)
- Ký số HMAC (chống giả mạo)
- Upload PDF lên file-service
- Gửi email thông báo
- **Internal status update endpoints:** đồng bộ trạng thái qua các service

**Flow ký hợp đồng:**
1. Hệ thống tạo hợp đồng → gửi OTP qua email
2. Tenant nhập OTP → `tenantSigned = true`
3. Landlord nhập OTP → `landlordSigned = true`
4. Cả hai đã ký → contract ACTIVE → publish Kafka event → billing tạo deposit bill

---

### 3.7 Billing Service (Port 8086)

**Vai trò:** Quản lý hóa đơn/chi phí hàng tháng.

**Entities:** `Bill`, `MeterReading`, `Utility`

**Chức năng chính:**
- Tạo hóa đơn hàng tháng (tiền phòng + điện + nước + internet + gửi xe + vệ sinh)
- Tính toán chi phí tự động (`BillCalculationService`)
- OCR đọc đồng hồ điện/nước (`MeterOcrService`, `VietnameseMeterOcrService`)
- Xuất PDF hóa đơn, gửi email
- Thống kê doanh thu (`BillStatisticsService`)
- Bulk operations (tạo nhiều hóa đơn 1 lúc)
- Tích hợp MoMo payment + QR Code thanh toán
- **Utility configuration per property:** Cấu hình giá điện/nước/internet riêng cho mỗi property

**Cron Job:** Tự kiểm tra hóa đơn quá hạn hàng ngày (`overdue-check-cron: 0 0 3 * * *`)

---

### 3.8 Payment Service (Port 8087)

**Vai trò:** Xử lý thanh toán online.

**Entity:** `Payment`

**Chức năng chính:**
- Tích hợp VNPay (cổng thanh toán ngân hàng)
- Tích hợp MoMo (ví điện tử) — HMAC-SHA256 signature
- Webhook nhận callback từ payment gateway
- Cập nhật trạng thái bill/contract sau thanh toán thành công

---

### 3.9 File Service (Port 8088)

**Vai trò:** Quản lý upload/download file (ảnh, tài liệu, PDF, 3D models).

**Entity:** `FileMgmt`

**Chức năng chính:**
- Upload file lên MinIO (S3-compatible object storage)
- Download/serve file qua API
- Cleanup file hết hạn (`FileCleanupTask`)
- Hỗ trợ multipart upload
- **3D model storage:** Lưu trữ file .glb từ COLMAP worker

---

### 3.10 Chat Service (Port 8089)

**Vai trò:** Real-time messaging giữa tenant và landlord.

**Entities:** `ChatMessage`, `Conversation`, `ParticipantInfo`, `WebSocketSession`

**Chức năng chính:**
- Tạo/quản lý conversation
- Gửi/nhận tin nhắn real-time qua WebSocket (STOMP protocol)
- Lưu trữ lịch sử chat
- Tìm kiếm conversation

---

### 3.11 Notification Service (Port 8090)

**Vai trò:** Hệ thống thông báo đa kênh.

**Entities:** `Notification`, `NotificationTemplate`

**Chức năng chính:**
- Nhận Kafka events từ các service khác
- Gửi thông báo qua: Email, WebSocket (real-time push), In-app
- Template-based notifications
- Lịch dọn dẹp notification cũ (retention 90 ngày)

**Kafka Consumers:** Lắng nghe topics: `BookingEvent`, `ContractEvent`, `PaymentEvent`, `PropertyEvent`, `MessageEvent`

---

### 3.12 AI Service (Port 8091)

**Vai trò:** Chatbot AI hỗ trợ người dùng.

**Entities:** `Conversation`, `Message`

**Chức năng chính:**
- Chatbot tư vấn tìm phòng (tích hợp Google Gemini API)
- Lưu lịch sử trò chuyện
- Gợi ý phòng phù hợp

---

### 3.13 Admin Service (Port 8081)

**Vai trò:** Quản trị hệ thống.

**Entities:** `UserActionLog`, `ErrorLog`, `SystemConfig`

**Chức năng chính:**
- Quản lý user (ban/unban, cập nhật role)
- Duyệt/từ chối property listings
- Xem activity logs real-time (WebSocket + Kafka + Elasticsearch)
- System configuration (cấu hình runtime)
- Dashboard thống kê (AdminDashboard — ~20KB component)

---

## 4. COLMAP 3D Reconstruction Worker

> **Service mới hoàn toàn** — Python Flask worker chạy trong Docker container.

### 4.1 Tổng quan

COLMAP Worker là service **Python** chạy pipeline tái tạo 3D từ ảnh chụp phòng trọ. Landlord upload ảnh → hệ thống tự động tạo mô hình 3D → hiển thị bằng Google Model Viewer trên frontend.

| Chi tiết | Giá trị |
|---|---|
| **Ngôn ngữ** | Python 3 (Flask) |
| **Port** | 5000 |
| **Container** | `roomie-colmap-worker` |
| **Dependencies** | COLMAP, Open3D, Trimesh, SciPy, Pillow |
| **Storage** | MinIO bucket `roomie-3d-models` |
| **Output** | `.glb` (GLB binary format) |

### 4.2 Pipeline Architecture

```
Images (URLs) → Download → Downscale (max 1600px)
     → COLMAP Feature Extraction (SIFT)
     → Feature Matching (Exhaustive ≤100 images / Vocab Tree >100)
     → Sparse Reconstruction (SfM)
     ├─[CUDA available]─→ Dense Path (PatchMatch → Stereo Fusion → Poisson Mesh)
     └─[CPU only]────────→ Sparse Path (PLY Export → Mesh)
     → Point Cloud Filtering (Statistical + Radius + DBSCAN)
     → Surface Reconstruction (Poisson → Ball Pivoting → Delaunay → Convex Hull fallback)
     → GLB Export + Material Injection
     → Upload to MinIO
     → Callback to property-service
```

### 4.3 API Endpoints

| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/reconstruct` | Bắt đầu reconstruction job (async) |
| `GET` | `/status/<job_id>` | Kiểm tra trạng thái job |
| `GET` | `/health` | Health check |

### 4.4 Chi tiết kỹ thuật quan trọng

**Point Cloud Filtering (3 stages):**
1. **Statistical outlier removal** (nb_neighbors=20, std_ratio=1.5)
2. **Radius outlier removal** — scaled theo scene size (scene_scale × 0.03)
3. **DBSCAN clustering** — giữ cluster lớn nhất, loại bỏ debris/floating points

**Surface Reconstruction (4 methods, cascade fallback):**
1. **Poisson** (depth 8-9) → ưu tiên, chất lượng cao nhất
2. **Ball Pivoting** → khi Poisson fail
3. **Delaunay** → khi Ball Pivoting fail
4. **Convex Hull** → fallback cuối cùng

**GLB Material Injection:** Fix three.js/model-viewer không render vertex colors bằng cách inject PBR material vào GLB binary (metallicFactor=0, roughnessFactor=0.85, doubleSided=true).

**Y-axis flip:** COLMAP sử dụng Y-down, WebGL sử dụng Y-up → flip Y trước khi export.

**Nearest-Neighbor Color Mapping:** Thay vì dùng Poisson interpolation (bị mờ), dùng cKDTree nearest-neighbor để map màu chính xác từ point cloud sang mesh vertices.

### 4.5 N8N Workflow Integration

N8N đóng vai trò **orchestrator** giữa Property Service và COLMAP Worker, cung cấp webhook trigger + status monitoring loop.

#### Kiến trúc Cross-Machine

```
┌─────────────────────────────────────────────────────────────────────┐
│                     WINDOWS (Development)                           │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │ React Frontend│    │ Property Service │    │ Other Spring Boot│  │
│  │    :3000      │───▶│    :8083         │    │ Services         │  │
│  └──────────────┘    └────────┬─────────┘    └──────────────────┘  │
│                               │                                     │
└───────────────────────────────┼─────────────────────────────────────┘
                                │ Tailscale VPN
┌───────────────────────────────┼─────────────────────────────────────┐
│                     UBUNTU SERVER                                    │
│                               │                                      │
│  ┌────────────────────────────▼───────────────────────────────────┐  │
│  │                    Docker Compose                               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │  MinIO   │  │  MongoDB │  │  Redis   │  │     n8n      │  │  │
│  │  │  :9000   │  │  :27017  │  │  :6379   │  │    :5678     │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────┬───────┘  │  │
│  └───────────────────────────────────────────────────┼───────────┘  │
│                                                       │              │
│  ┌────────────────────────────────────────────────────▼───────────┐  │
│  │              COLMAP Worker (Host / venv)                        │  │
│  │                    :5000                                        │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │  app.py  │  │ pipeline.py  │  │ converter.py │             │  │
│  │  │ Flask API│  │ COLMAP SfM   │  │ PLY → GLB    │             │  │
│  │  └──────────┘  └──────────────┘  └──────────────┘             │  │
│  │  GPU: NVIDIA RTX 3050 (4GB) — CUDA 12.8                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

#### Luồng xử lý End-to-End

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
   POST http://172.18.0.1:5000/reconstruct  (host.docker.internal)
       │
5. COLMAP Worker (background thread):
   ├── Download ảnh từ MinIO URLs
   ├── Downscale ảnh (max 1600px)
   ├── COLMAP Feature Extraction (SIFT, max 8192 features)
   ├── COLMAP Feature Matching (Exhaustive ≤100 / Vocab Tree >100)
   ├── COLMAP Sparse Reconstruction (SfM)
   ├── [CUDA] Dense: PatchMatch → Stereo Fusion
   ├── Point Cloud Filtering (Statistical + Radius + DBSCAN)
   ├── Surface Reconstruction (Poisson/Ball Pivoting/Delaunay)
   ├── GLB Export + PBR Material Injection
   ├── Upload .glb → MinIO (bucket: roomie-3d-models)
   └── Callback POST → Property Service /internal/3d-callback
       │
6. Property Service nhận callback:
   ├── Set model3dUrl = "http://minio/roomie-3d-models/{id}/{id}.glb"
   ├── Set model3dStatus = "COMPLETED"
   └── Set model3dCompletedAt = now()
       │
7. Frontend hiển thị mô hình 3D qua <model-viewer> (Google)
```

#### N8N Workflow Nodes (8 nodes)

```
[Webhook Trigger] → [Call COLMAP Worker] → [Save Job Info] → [Wait 30s]
                                                                  │
[Done] ← [Is Complete? YES] ← [Check Status] ←─────────────────┘
                    │ NO
             [Is Failed?]
              │ YES    │ NO
         [Failed—Stop] └→ [Wait 30s] (loop)
```

| Node | Type | Mô tả |
|---|---|---|
| **Webhook Trigger** | `webhook` | Nhận POST `/webhook/3d-reconstruct` từ Property Service |
| **Call COLMAP Worker** | `httpRequest` | Forward request tới `http://host.docker.internal:5000/reconstruct` |
| **Save Job Info** | `set` | Lưu `jobId` + `propertyId` cho polling |
| **Wait 30s** | `wait` | Đợi 30 giây trước khi check status |
| **Check Status** | `httpRequest` | GET `/status/{jobId}` từ COLMAP Worker |
| **Is Complete?** | `if` | Check `status === "completed"` |
| **Is Failed?** | `if` | Check `status === "failed"` → stop hoặc loop lại |
| **Done** | `noOp` | End node (thành công) |

#### N8N Workflow Template

File: `infra/colmap-worker/n8n-workflow-3d-reconstruction.json` — import vào n8n UI.

#### Property Service — Backend Entity Fields

```java
// Property entity (MongoDB)
String model3dUrl;           // URL file .glb trên MinIO
String model3dStatus;        // NONE, PROCESSING, COMPLETED, FAILED
Boolean model3dVisible;      // Có hiển thị cho người xem không
Instant model3dRequestedAt;  // Thời điểm yêu cầu tạo 3D
Instant model3dCompletedAt;  // Thời điểm hoàn thành
```

#### Internal Callback API

```
POST /property/internal/3d-callback
{
  "propertyId": "69d41a65e349b0663c48038b",
  "model3dUrl": "http://minio/roomie-3d-models/69d41a65.../69d41a65....glb",
  "status": "COMPLETED"    // hoặc "FAILED" + "errorMessage"
}
```

#### Frontend Components

| Component | File | Vai trò |
|---|---|---|
| `Model3DSection.jsx` | `components/domain/property/` | Section trên trang detail: hiển thị trạng thái (Processing / Failed / Completed) |
| `Model3DViewer.jsx` | `components/domain/property/` | Render GLB bằng `<model-viewer>` (auto-rotate, orbit controls, loading overlay) |
| `Step4Media.jsx` | `pages/Property/steps/` | Trang edit: nút "Tạo mô hình 3D", toggle visibility |

### 4.6 Cài đặt & Triển khai COLMAP Worker

#### Yêu cầu hệ thống

- Ubuntu 22.04+ (khuyến nghị có NVIDIA GPU)
- Python 3.12+
- COLMAP (build với CUDA nếu có GPU)
- Docker Compose (cho MinIO, n8n, databases)

#### Cài đặt trên Ubuntu

```bash
# 1. Build COLMAP (với CUDA)
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

# 3. Chạy service (development)
export MINIO_ENDPOINT="localhost:9000"
export MINIO_PUBLIC_ENDPOINT="100.96.78.62:9000"
export MINIO_ACCESS_KEY="roomie"
export MINIO_SECRET_KEY="<secret>"
export MINIO_BUCKET_3D="roomie-3d-models"
export PROPERTY_CALLBACK_URL="http://100.69.114.54:8083/property/internal/3d-callback"
python3 app.py
```

#### Chạy nền (production)

```bash
nohup python3 app.py > /tmp/colmap-worker.log 2>&1 &
```

Hoặc dùng **systemd service** (khuyến nghị):

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

```bash
sudo systemctl enable colmap-worker
sudo systemctl start colmap-worker
sudo journalctl -u colmap-worker -f   # xem log
```

#### Environment Variables

| Biến | Mô tả | Mặc định |
|---|---|---|
| `MINIO_ENDPOINT` | MinIO internal endpoint | `minio:9000` |
| `MINIO_PUBLIC_ENDPOINT` | MinIO public URL (cho GLB access) | = MINIO_ENDPOINT |
| `MINIO_ACCESS_KEY` | MinIO access key | `roomie` |
| `MINIO_SECRET_KEY` | MinIO secret key | *(required)* |
| `MINIO_BUCKET_3D` | Bucket lưu 3D models | `roomie-3d-models` |
| `MINIO_SECURE` | HTTPS cho MinIO | `false` |
| `PROPERTY_CALLBACK_URL` | Property Service callback | `http://property-service:8083/property/internal/3d-callback` |
| `WORKSPACE_DIR` | Thư mục tạm cho jobs | `/workspace` |

### 4.7 Sparse vs Dense Path

| | Sparse Path (CPU) | Dense Path (CUDA GPU) |
|---|---|---|
| **Khi nào** | Không có CUDA | Có NVIDIA GPU + CUDA |
| **Số điểm 3D** | ~100K | Hàng triệu |
| **Chất lượng** | Trung bình | Cao |
| **Thời gian** | ~30-45 phút | ~15-25 phút |
| **Pipeline** | Extract → Match → SfM → PLY → GLB | Extract → Match → SfM → Undistort → PatchMatch → Fusion → GLB |

### 4.8 Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|---|---|---|
| Model trắng (không màu) | GLB thiếu PBR material | converter.py v3 đã fix bằng `_inject_vertex_color_material()` |
| Model lộn ngược | COLMAP Y-down ≠ WebGL Y-up | converter.py v3 đã fix bằng Y-axis flip |
| Mảnh rời bay xung quanh | Noise trong point cloud | DBSCAN clustering giữ cluster lớn nhất |
| Callback refused | Property Service IP sai | Kiểm tra `PROPERTY_CALLBACK_URL` (dùng Tailscale IP) |
| SfM failed: sparse/0 not found | Ảnh không đủ overlap | Cần ≥8 ảnh với 60-80% overlap |
| Model quá thô | Dùng sparse path (CPU only) | Cài CUDA-enabled COLMAP trên GPU machine |
| Loading kẹt trên frontend | model-viewer chưa load xong | Model3DViewer.jsx dùng event `load` để ẩn overlay |
| n8n không gọi được worker | Docker network isolation | Dùng `host.docker.internal:5000` hoặc `172.18.0.1:5000` |

### 4.9 Hướng dẫn chụp ảnh tốt cho 3D

1. **Số lượng**: Tối thiểu 8, khuyến nghị 15-30 ảnh
2. **Góc chụp**: Xoay quanh phòng/tòa nhà, mỗi ảnh overlap 60-80%
3. **Chất lượng**: Ảnh rõ nét, không bị mờ/rung
4. **Ánh sáng**: Đều, tránh ngược sáng
5. **Tránh**: Gương, kính phản chiếu, vật di chuyển (người, xe)

---

## 5. Database & Data Model

### 5.1 Polyglot Persistence

| Database | Dùng cho | Lý do |
|---|---|---|
| **MySQL** | User, Role, Permission | Quan hệ Many-to-Many cần ACID transaction + JOIN |
| **MongoDB** | Property, Contract, Bill, Payment, Chat... | Schema linh hoạt, embedded documents |
| **Neo4j** | UserProfile + relationships | Graph traversal nhanh cho relationship queries |
| **Redis** | Cache, distributed lock, session | In-memory → cực nhanh cho caching và locking |
| **Elasticsearch** | Property search index | Full-text search, fuzzy matching, geo-search |
| **MinIO** | File/image/3D model storage | S3-compatible object storage, self-hosted |

### 5.2 Các Entity chính

```
User (MySQL - identity)
├── id (UUID), username, email, phoneNumber (unique)
├── password (BCrypt hashed)
├── emailVerified, isActive, isBanned
├── authProvider (local/google/facebook)
└── roles → Set<Role> (Many-to-Many)

UserProfile (Neo4j - profile)
├── id, userId, firstName, lastName, avatar
├── gender, dob, idCardNumber, permanentAddress
└── status (AccountStatus)

Property (MongoDB - property)
├── propertyId, title, description
├── address (embedded: province, district, ward, street, latitude, longitude)
├── monthlyRent, rentalDeposit (BigDecimal)
├── propertyType, propertyStatus, propertyLabel
├── amenities (embedded: wifi, aircon, parking...)
├── mediaList (embedded: url, type)
├── owner (embedded: userId, name, phone)
├── model3dUrl (URL to GLB file in MinIO)
└── status (ApprovalStatus: PENDING/APPROVED/REJECTED)

LeaseLongTerm (MongoDB - booking)
├── id, propertyId, landlordId, tenantId
├── leaseStart, leaseEnd, monthlyRent, rentalDeposit
└── status (LeaseStatus)

Contract (MongoDB - contract)
├── id, bookingId, propertyId, tenantId, landlordId
├── startDate, endDate, monthlyRent, rentalDeposit
├── tenantSigned, landlordSigned
├── pdfUrl, signatureToken, status, version (Optimistic Lock)

Bill (MongoDB - billing)
├── id, contractId, landlordId, tenantId, propertyId
├── electricity/water (old/new/consumption/unitPrice/amount)
├── internet/parking/cleaning/maintenance prices
├── totalAmount, billingMonth, dueDate, status

Payment (MongoDB - payment)
├── id, userId, bookingId, contractId, billId
├── amount, method (VNPAY/MOMO/CASH)
├── status (PENDING/PROCESSING/COMPLETED/FAILED)
└── transactionId, paymentUrl, paidAt
```

---

## 6. Luồng Xử Lý Chính

### 6.1 Flow: End-to-End (Đăng ký → Thuê phòng)

```
1. ĐĂNG KÝ
   User → POST /identity/users/register
   └→ Identity tạo User (MySQL) + publish Kafka "user-events"
   └→ Profile Service consumer → tạo UserProfile (Neo4j)

2. ĐĂNG TIN (Landlord)
   Landlord → POST /property/properties (tạo tin)
   └→ Upload ảnh qua /file/media/upload → MinIO
   └→ (Tùy chọn) Trigger 3D reconstruction → COLMAP worker
   └→ Property lưu MongoDB (status: PENDING)
   └→ Admin duyệt → APPROVED → xuất hiện trên search

3. TÌM PHÒNG (Tenant)
   Tenant → GET /property/properties/search?q=...
   └→ Elasticsearch full-text search → return danh sách property
   └→ (Hoặc) Tìm "nearby" theo tọa độ GPS → geo-search

4. ĐẶT PHÒNG
   Tenant → POST /booking/leases (tạo booking)
   └→ Redis lock tránh double booking
   └→ Kafka event → Notification cho Landlord

5. DUYỆT BOOKING
   Landlord → PUT /booking/leases/{id}/approve
   └→ Kafka event → Contract Service tạo hợp đồng

6. KÝ HỢP ĐỒNG
   Hệ thống tạo Contract → gửi OTP email
   Tenant ký (nhập OTP) → Landlord ký (nhập OTP)
   └→ Contract ACTIVE → sinh PDF → upload file-service
   └→ Kafka event → Billing tạo hóa đơn deposit tự động

7. THANH TOÁN
   Landlord tạo Bill hàng tháng (tiền phòng + điện + nước)
   Tenant → POST /payment/create (chọn VNPay/MoMo)
   └→ Redirect tới payment gateway → thanh toán
   └→ Webhook callback → update bill PAID
   └→ Kafka event → Notification cho cả 2 bên
```

### 6.2 Flow: 3D Reconstruction

```
Landlord upload ≥3 ảnh phòng
→ Frontend gọi POST /reconstruct (colmap-worker:5000)
→ Worker download ảnh → chạy COLMAP pipeline (async)
→ Export .glb → upload MinIO (bucket: roomie-3d-models)
→ Callback POST /property/internal/3d-callback
   { propertyId, model3dUrl, status: "COMPLETED" }
→ Property service lưu model3dUrl vào MongoDB
→ Frontend render 3D model bằng <model-viewer>
```

### 6.3 Flow: Chat real-time

```
Tenant mở chat → WebSocket connect (STOMP)
Tenant gửi tin nhắn → POST /chat/messages
└→ Lưu MongoDB + broadcast qua WebSocket
Landlord nhận tin nhắn real-time
```

---

## 7. Bảo Mật & Authentication

### 7.1 JWT Authentication Flow

```
1. Login: POST /identity/auth/token
   → Verify credentials → Generate JWT (HMAC-SHA)
   → Return { accessToken, refreshToken }

2. Mỗi request tiếp theo:
   → Frontend gửi Header: Authorization: Bearer <token>
   → API Gateway intercept → gọi /identity/auth/introspect
   → Token valid? → forward request | Token invalid → 401

3. Token Refresh: POST /identity/auth/refresh-token
4. Logout: POST /identity/auth/logout → blacklist token
```

### 7.2 Authorization (RBAC)

| Role | Quyền |
|---|---|
| **TENANT** | Tìm phòng, booking, ký hợp đồng, xem hóa đơn, thanh toán, chat |
| **LANDLORD** | Tất cả của tenant + đăng tin, quản lý phòng, tạo hóa đơn |
| **ADMIN** | Duyệt property, quản lý user, xem log, cấu hình hệ thống |

**Frontend guard:** `RoleProtectedRoute` + `VerificationGuard` component.
**Backend guard:** `SecurityConfig` + `CustomJwtDecoder`.

### 7.3 OAuth2 Social Login

- Google OAuth2 + Facebook OAuth2: Authorization Code Flow
- Redirect URI: `http://localhost:3000/oauth2/callback`

---

## 8. Frontend Architecture

### 8.1 Cấu trúc thư mục (Updated)

```
frontend/src/
├── components/
│   ├── common/              # 15 shared UI components
│   │   ├── RoleProtectedRoute.jsx
│   │   ├── VerificationGuard.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── SettingsMenu.jsx
│   │   ├── ToastContainer.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── LoadingSpinner.jsx, Button, Input, ...
│   ├── domain/              # Domain-specific components
│   │   ├── auth/            # LoginForm, RegisterForm
│   │   ├── billing/         # 21 components (CreateBillModal, MeterReadingModal, PaymentModal...)
│   │   ├── booking/         # 13 components (BookingCard, BookingDetailModal, filters...)
│   │   ├── chat/            # 9 components (ChatArea, MessageBubble, ConversationList...)
│   │   ├── contract/        # 7 components + signing/ (9 components: OTPModal, PDFViewer...)
│   │   ├── dashboard/       # 7 components (RevenueChartRecharts, StatCard, QuickActions...)
│   │   ├── notification/    # 4 components (NotificationBell, Dropdown, Toast...)
│   │   ├── profile/         # 8 components (EditProfileForm, CameraModal, ProfileOverview...)
│   │   └── property/        # 25 components ⭐ (PropertyCard, MapView, Model3DViewer, GoogleMapPicker...)
│   ├── layout/
│   │   ├── layoutAdmin/     # Admin panel layout
│   │   ├── layoutHome/      # Public pages layout
│   │   └── layoutUser/      # Authenticated user layout
│   └── AppProviders.jsx     # All context providers wrapped
├── contexts/                # 9 React Contexts
│   ├── AuthContext.jsx
│   ├── CallContext.jsx       # ⭐ Video/voice call integration
│   ├── DialogContext.jsx
│   ├── NotificationContext.jsx
│   ├── RefreshContext.jsx
│   ├── RoleContext.jsx
│   ├── SocketContext.jsx     # ⭐ WebSocket connection management
│   ├── ThemeContext.jsx
│   └── UserContext.jsx
├── hooks/                   # 8 custom hook folders
│   ├── billing/, booking/, chat/, common/
│   ├── contract/, dashboard/, profile/, property/
├── configurations/
│   ├── configuration.js     # App-wide config (13.5KB)
│   └── httpClient.js        # Axios instance setup
├── services/                # 27 API service files
├── i18n/                    # vi/ + en/ translation files
├── pages/                   # 11 page directories
├── routes/                  # AppRoutes.jsx (277 lines)
├── styles/                  # Global CSS
└── utils/                   # Utility functions
```

### 8.2 Các trang chính (Routes)

| Route | Component | Quyền | Mô tả |
|---|---|---|---|
| `/` | Home | Public | Trang chủ, danh sách phòng nổi bật |
| `/search` | PropertySearch | Public | Tìm kiếm phòng với bộ lọc + **Map View** |
| `/property/:id` | PropertyDetail | Public | Chi tiết phòng + **3D Model Viewer** |
| `/user/:userId` | UserProfile | Public | Xem profile công khai |
| `/login` | Login | Public | Đăng nhập |
| `/register` | Register | Public | Đăng ký |
| `/forgot-password` | ForgotPassword | Public | Quên mật khẩu |
| `/oauth2/callback` | OAuth2Callback | Public | OAuth2 redirect |
| `/identity-verification` | IdentityVerification | Login | Xác minh CCCD |
| `/profile` | Profile | Verified | Quản lý hồ sơ |
| `/dashboard` | Dashboard | Verified | Dashboard + **Revenue Chart (Recharts)** |
| `/my-bookings` | MyBookings | Verified | Danh sách booking |
| `/my-contracts` | MyContracts | Verified | Danh sách hợp đồng |
| `/contract-signing/:id` | ContractSigning | Verified | Ký hợp đồng (OTP) |
| `/unified-bills` | UnifiedBillsPage | Verified | Tất cả hóa đơn |
| `/bill-detail/:id` | BillDetail | Verified | Chi tiết hóa đơn |
| `/payment-result` | PaymentResult | Public | Kết quả thanh toán |
| `/add-property` | AddProperty | Verified | Đăng tin mới |
| `/my-properties` | MyProperties | Verified | Quản lý tin đăng |
| `/my-favorites` | MyFavorites | Login | Phòng yêu thích |
| `/message` | Message | Verified | Chat |
| `/notifications` | NotificationCenter | Login | Trung tâm thông báo |
| `/admin/dashboard` | AdminDashboard | Admin | Admin overview |
| `/admin/properties` | AdminProperties | Admin | Duyệt property |
| `/admin/users` | AdminUsers | Admin | Quản lý users |

### 8.3 Tính năng Frontend mới (so với phiên bản trước)

| Tính năng | Component/File | Mô tả |
|---|---|---|
| **3D Model Viewer** | `Model3DViewer.jsx`, `Model3DSection.jsx` | Xem mô hình 3D phòng bằng `<model-viewer>` |
| **Map Search View** | `PropertyMapView.jsx` (18.6KB) | Tìm phòng trên bản đồ Leaflet với MarkerClusterer |
| **Google Maps Picker** | `GoogleMapPicker.jsx` | Chọn vị trí khi đăng tin (geocoding) |
| **Revenue Chart** | `RevenueChartRecharts.jsx` (15.4KB) | Biểu đồ doanh thu với Recharts |
| **Video/Voice Call** | `CallContext.jsx` (12KB) | WebRTC video call integration |
| **Notification Center** | `NotificationsPage`, `NotificationBell` | Trang thông báo + bell dropdown |
| **Meter Reading OCR** | `MeterReadingModal.jsx` (17.5KB) | Upload ảnh đồng hồ → OCR đọc chỉ số |
| **Wheel Date Picker** | `WheelDatePicker.jsx` | Custom mobile-friendly date picker |
| **Dark Mode** | `ThemeContext.jsx`, `ThemeToggle.jsx` | Toggle sáng/tối |
| **Settings Menu** | `SettingsMenu.jsx` | Cài đặt ngôn ngữ, theme |
| **Error Boundary** | `ErrorBoundary.jsx` | Catch React errors, hiển thị fallback UI |

### 8.4 Build System

Frontend đã **migrate từ CRA sang Vite**:
- Dev server: `npm start` → chạy Vite (nhanh hơn CRA ~10x)
- Dual build: `npm run build` (CRA) hoặc `npm run build:vite` (Vite)
- Plugin: `@vitejs/plugin-react-swc` (SWC compiler thay Babel)
- Env: Load từ `infra/.env` qua `dotenv-cli`

### 8.5 Code Splitting

Toàn bộ 25+ page components sử dụng `React.lazy()` + `Suspense` → code splitting tự động.

---

## 9. Giao Tiếp Giữa Các Service

### 9.1 Synchronous (REST — OpenFeign)

```
booking-service → ProfileClient, PropertyClient
contract-service → PropertyClient, ProfileClient, BillingClient, FileClient
billing-service → ContractClient, PropertyClient, FileClient
payment-service → BillClient, ContractClient, ProfileClient, FileClient
admin-service → UserClient (identity), PropertyClient
colmap-worker → PropertyClient (HTTP callback)
```

**AuthenticationRequestInterceptor** tự động forward JWT token khi gọi cross-service.

### 9.2 Asynchronous (Kafka Events)

```
identity-service  → "user-events"      → profile-service (tạo profile)
booking-service   → "BookingEvent"     → notification-service
contract-service  → "ContractEvent"    → notification-service + billing-service
payment-service   → "PaymentEvent"     → notification-service + contract-service
property-service  → "PropertyEvent"    → notification-service
```

---

## 10. Infrastructure & DevOps

### 10.1 Docker Compose Services (11 containers)

```yaml
mongodb:          mongo:7.0             # Document DB
mysql:            mysql:8.0             # Relational DB
neo4j:            neo4j:5.15            # Graph DB (APOC plugin)
redis:            redis:7.2-alpine      # Cache + Lock
kafka:            cp-kafka:7.5.0        # Message Broker
zookeeper:        cp-zookeeper:7.5.0    # Kafka coordination
elasticsearch:    elasticsearch:8.11.0  # Search Engine (xpack.security=true)
minio:            minio:RELEASE.2024    # Object Storage
prometheus:       prom/prometheus:v2.47 # Metrics
eureka-server:    eureka-server         # Service Discovery
colmap-worker:    custom Dockerfile     # 3D Reconstruction ⭐ NEW
```

### 10.2 Build & Run

```bash
# 1. Start infrastructure
cd infra && docker-compose --env-file .env up -d

# 2. Build all 13 services
cd backend && mvn clean install -DskipTests

# 3. Run backend (Windows)
infra\scripts\backend-runtime\run-from-jars.bat
# Or use PowerShell:
powershell -File infra\scripts\backend-runtime\launch-all-fast.ps1

# 4. Run frontend
cd frontend && npm install && npm start
```

### 10.3 Infrastructure Scripts

| Script | Đường dẫn | Mô tả |
|---|---|---|
| `run-from-jars.bat` | `infra/scripts/backend-runtime/` | Chạy 13 services từ JAR files |
| `launch-all-fast.ps1` | `infra/scripts/backend-runtime/` | PowerShell fast launch |
| `build-all.ps1` | `infra/scripts/backend-runtime/` | Build all Maven modules |
| `check-services.ps1` | `infra/scripts/backend-runtime/` | Health check tất cả services |
| `stop-all-services.ps1` | `infra/scripts/backend-runtime/` | Stop all running services |
| `backup-db.sh` | `infra/scripts/database/` | Backup MySQL + MongoDB + Neo4j |
| `seed-all.ps1` | `infra/scripts/database/` | Seed test data |
| `seed-neo4j.ps1` | `infra/scripts/database/` | Seed Neo4j graph data |
| `deploy-vps.sh` | `infra/scripts/deployment/` | Deploy lên VPS |
| `setup-ubuntu.sh` | `infra/scripts/deployment/` | Ubuntu one-time server setup |
| `smoke-test-vps.sh` | `infra/scripts/deployment/` | Post-deploy smoke test |

### 10.4 Multi-Machine / Shared Infra (Tailscale LAN)

Dự án hỗ trợ multi-machine development qua Tailscale VPN:
- **Host machine:** Chạy Docker Compose, chia sẻ DB ports
- **Partner machine:** Connect tới host qua Tailscale IP, không cần local containers
- Cấu hình: Set `*_HOST` env vars tới Tailscale IP trong `infra/.env`
- **Partner Onboarding Checklist:** `docs/PARTNER_ONBOARDING_CHECKLIST.md`
- **Connectivity test script:** `infra/scripts/partner-port-test.ps1`

### 10.5 VPS Production Deployment Roadmap

| Phase | Mô tả |
|---|---|
| **Phase 1** | Single VPS + Docker Compose + Automated DB Backups |
| **Phase 2** | Migrate DB sang managed services (MongoDB Atlas, RDS...) |
| **Phase 3** | Kubernetes khi cần scale |

Templates sẵn có:
- Nginx reverse proxy: `infra/config/nginx/nginx.vps.conf.template`
- Deploy script: `infra/scripts/deployment/deploy-vps.sh`
- Smoke test: `infra/scripts/deployment/smoke-test-vps.sh`

### 10.6 Database Init Scripts

| File | Mô tả |
|---|---|
| `infra/init.sql` | MySQL schema init (users, roles, permissions) |
| `infra/init-mongo.js` | MongoDB databases + users cho 11 service databases |
| `infra/init-neo4j.cypher` | Neo4j constraints + indexes |

### 10.7 Swagger API Documentation

Mọi service đều có Swagger UI (chỉ bật ở `dev` profile):
```
http://localhost:<PORT><CONTEXT_PATH>/swagger-ui.html
```

---

## 11. Các Pattern & Công Nghệ Cần Nắm

### 11.1 Design Patterns

| Pattern | Nơi áp dụng | Giải thích |
|---|---|---|
| **API Gateway** | api-gateway | Single entry point |
| **CQRS** | identity ↔ profile | Command tách riêng Query |
| **Event-Driven** | Kafka events | Loose coupling |
| **Repository** | Spring Data JPA/MongoDB | Data access abstraction |
| **DTO + Mapper** | MapStruct | Entity ↔ DTO conversion |
| **Builder** | Lombok `@Builder` | Fluent object creation |
| **Strategy** | Payment (VNPay/MoMo) | Nhiều phương thức thanh toán |
| **Cascade Fallback** | COLMAP converter | Poisson → Ball Pivoting → Delaunay → Convex Hull |
| **Distributed Lock** | Redis lock (booking) | Tránh race condition |
| **Optimistic Lock** | Contract `@Version` | Tránh concurrent update |
| **Circuit Breaker** | OpenFeign | Resilience khi service DOWN |
| **Async Job Processing** | COLMAP worker threads | Background processing |
| **Observer** | Kafka pub/sub | Event notification |

### 11.2 Thư viện quan trọng (Backend)

| Thư viện | Vai trò |
|---|---|
| **Spring Boot 3.2.5** | Framework chính |
| **Spring Cloud Gateway** | API Gateway (WebFlux) |
| **Spring Security** | JWT + OAuth2 |
| **Spring Data JPA/MongoDB/Neo4j/Redis/Elasticsearch** | Data access |
| **Spring Kafka** | Message broker |
| **OpenFeign** | Declarative REST client |
| **MapStruct 1.5.5** | Object mapping (compile-time) |
| **Lombok 1.18.34** | Boilerplate reduction |
| **JJWT 0.12.6** | JWT signing & parsing |
| **Springdoc OpenAPI** | Swagger UI (dev only) |

### 11.3 Dependencies quan trọng (Frontend)

| Library | Vai trò |
|---|---|
| **React 19.2** | UI framework |
| **MUI v7.3** | Complex components |
| **Tailwind CSS v3.4** | Utility CSS |
| **Vite 7.1** | Build tool (SWC) |
| **React Router v7.9** | Client routing |
| **Axios 1.13** | HTTP client |
| **Leaflet + react-leaflet v5** | Maps |
| **@google/model-viewer v4.2** | 3D GLB viewer |
| **Recharts v3.6** | Charts |
| **Socket.IO / STOMP** | Real-time messaging |
| **i18next** | Internationalization |
| **Lucide React** | Icon library |
| **jsQR** | QR code scanning |
| **jwt-decode** | JWT parsing |
| **date-fns / dayjs** | Date utilities |

---

## 12. Câu Hỏi Phỏng Vấn Thường Gặp

### 12.1 Câu hỏi tổng quan

**Q1: Giới thiệu tổng quan dự án Roomie.**
> Roomie là nền tảng quản lý cho thuê phòng trọ, xây dựng theo kiến trúc microservices với 13 service backend (Spring Boot) + 1 Python worker (3D reconstruction), frontend React 19 với Vite, sử dụng polyglot persistence (MySQL, MongoDB, Neo4j), Kafka cho event-driven communication, Elasticsearch cho full-text + geo-search, Redis cho caching và distributed lock, COLMAP cho 3D room reconstruction.

**Q2: Tại sao chọn microservices thay vì monolith?**
> Nhiều bounded context rõ ràng, cần scale riêng từng service, tech diversity (Java cho business logic, Python cho ML/3D processing), team independence.

**Q3: Dự án dùng bao nhiêu database? Tại sao Polyglot Persistence?**
> 6 loại DB, mỗi loại cho use case riêng. MySQL cho auth (ACID + JOIN), MongoDB cho domain data (schema linh hoạt), Neo4j cho graph relationships, Redis cho cache/lock, Elasticsearch cho search/geo, MinIO cho object storage.

### 12.2 Câu hỏi kỹ thuật

**Q4: Giải thích COLMAP 3D reconstruction pipeline.**
> Nhận ảnh → SIFT feature extraction → exhaustive matching → sparse reconstruction (SfM) → point cloud filtering (statistical + radius + DBSCAN) → surface reconstruction (Poisson mesh, fallback Ball Pivoting/Delaunay) → nearest-neighbor color mapping → GLB export + material injection → upload MinIO → callback tới property-service.

**Q5: Tại sao cần inject material vào GLB?**
> Three.js và model-viewer mặc định không render vertex colors từ GLB. Phải inject PBR material với `baseColorFactor=[1,1,1,1]`, `metallicFactor=0`, `roughnessFactor=0.85`, `doubleSided=true` vào primitives có `COLOR_0` attribute.

**Q6: JWT hoạt động như thế nào?**
> JWT gồm Header.Payload.Signature. Identity service phát JWT khi login, API Gateway verify bằng introspect endpoint. Token invalidation bằng blacklist table. Refresh token cho phép lấy access token mới.

**Q7: Distributed Lock dùng ở đâu?**
> Redis SETNX trong booking-service tránh double booking. Acquire lock trên propertyId 15 phút.

**Q8: Geo-search hoạt động thế nào?**
> Property có latitude/longitude trong address. Elasticsearch geo_distance query tìm property trong bán kính X km. Frontend hiển thị trên Leaflet map với MarkerClusterer.

**Q9: Tại sao dùng Vite thay CRA?**
> Vite HMR nhanh hơn ~10x so với CRA (Webpack). SWC compiler thay Babel. Dev experience tốt hơn nhiều.

### 12.3 Câu hỏi Architecture

**Q10: Làm sao đảm bảo data consistency giữa các service?**
> Eventual Consistency qua Kafka events. Payment complete → publish event → billing update. Kafka retain message nếu consumer fail → retry. Cho case critical, check lại bằng REST call.

**Q11: Nếu 1 service bị DOWN, hệ thống xử lý thế nào?**
> OpenFeign có timeout + fallback. Kafka messages persist → consumer xử lý khi up lại. Health check phân biệt HEALTHY / DEGRADED / OFFLINE.

**Q12: Giải thích Cascade Fallback trong COLMAP converter.**
> Poisson (chất lượng cao nhất) → nếu fail → Ball Pivoting → nếu fail → Delaunay → nếu fail → Convex Hull (fallback cuối). Đảm bảo luôn có output dù input chất lượng thấp.

---

## 13. Demo Script

### 13.1 Demo Flow gợi ý (12 phút)

1. **[1 phút] Giới thiệu kiến trúc** — show sơ đồ hệ thống, giải thích microservices
2. **[1 phút] Start hệ thống** — `docker-compose up`, run services, health check
3. **[1 phút] Đăng ký + Đăng nhập** — register → OTP verify → login → JWT token
4. **[1 phút] Xác minh CCCD** — quét QR CCCD → điền thông tin
5. **[2 phút] Landlord đăng tin** — tạo property → upload ảnh → Google Maps picker → admin duyệt
6. **[1 phút] Tenant tìm phòng** — full-text search → bộ lọc → **Map View** → xem chi tiết
7. **[1 phút] 3D Model Viewer** — xem phòng 3D trên trình duyệt ⭐
8. **[1 phút] Booking + Ký hợp đồng** — đặt phòng → duyệt → ký OTP → PDF
9. **[1 phút] Hóa đơn + Thanh toán** — tạo bill → **OCR đọc đồng hồ** → thanh toán VNPay/MoMo
10. **[1 phút] Chat + Notification** — nhắn tin real-time + push notification + AI chatbot
11. **[1 phút] Admin Panel** — dashboard thống kê + duyệt tin + quản lý user

### 13.2 Các điểm highlight khi demo

- **3D Room Viewer** — xem phòng trọ 3 chiều từ ảnh chụp ⭐
- **Map Search** — tìm phòng trên bản đồ, nearby search ⭐
- **Real-time chat** qua WebSocket
- **OCR đọc đồng hồ** từ ảnh chụp
- **Ký hợp đồng điện tử** với OTP
- **Thanh toán online** VNPay/MoMo
- **Full-text search** tiếng Việt + geo-search
- **AI Chatbot** tư vấn phòng (Google Gemini)
- **Admin panel** real-time log + dashboard Recharts
- **i18n** chuyển đổi Tiếng Việt / English
- **Dark Mode** toggle
- **Revenue Charts** biểu đồ doanh thu

---

> **Ghi nhớ quan trọng:** Luôn sẵn sàng giải thích **TẠI SAO** chọn công nghệ X thay vì Y, không chỉ biết **đã dùng gì**. Phỏng vấn viên đánh giá khả năng tư duy kiến trúc, không chỉ coding.
