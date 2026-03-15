# Roomie Deployment Guide

> ⚠️ **IMPORTANT**: Mọi thông tin mật khẩu/secret tuyệt đối KHÔNG ĐƯỢC push lên VCS (Git, SVN...)

Dự án Roomie bao gồm hệ thống 13 microservices backend và giao diện web (React/Next.js frontend).
Tài liệu này hướng dẫn cách build, cấu hình bảo mật và deploy toàn bộ project.

---

## 1. Yêu Cầu Hệ Thống (Prerequisites)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (v4.0+)
- [Java 21](https://adoptium.net/) (dành cho Backend services)
- [Node.js v20+](https://nodejs.org/) (dành cho Frontend)
- [Maven v3.9+](https://maven.apache.org/)

---

## 2. Infrastructure Setup (Cơ sở dữ liệu & Third-parties)

Các dịch vụ hạ tầng bao gồm: `MySQL, MongoDB, Neo4j, Redis, MinIO, Zookeeper, Kafka, Elasticsearch`

### Bước 2.1: Khởi tạo Environment Variables
Hạ tầng dùng Docker yêu cầu mật khẩu bảo mật (Không dùng default passwords `roomie123`).

1. Chuyển vào thư mục hạ tầng:
   ```bash
   cd infra
   ```
2. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
3. Mở file `.env` lên và thay thế TẤT CẢ chuỗi `CHANGE_ME_use_openssl_rand` thành mật khẩu mạnh thực sự (Tối thiểu 16 ký tự, gồm số, chữ và ký tự đặc biệt). Đảm bảo cấu hình đầy đủ cả phần database passwords và **Application Secrets** (VD: `JWT_SECRET`, `VNPAY_SECRET_KEY`, `MAIL_PASSWORD`, v.v...).

> **Gợi ý tạo mật khẩu ngẫu nhiên trên Terminal**: 
> `openssl rand -base64 24`

### Bước 2.2: Khởi động Hạ tầng (Infrastructure)
Khi file `.env` đã được cấu hình đủ, tiến hành chạy Docker:
```bash
docker-compose --env-file .env up -d
```
> Việc này sẽ tải image và khởi động tất cả Databases, Kafka và MinIO. Có thể mất một chút thời gian tùy thuộc vào tốc độ mạng.

Kiểm tra trạng thái các container:
```bash
docker-compose ps
```

---

## 3. Backend Microservices Deployment

Hệ thống có 13 microservices được build thống nhất qua `roomie-parent`.

### Bước 3.1: Biên dịch (Build)
Chuyển vào thư mục services:
```bash
cd services
```

Clean và build bằng Maven thông qua Parent POM:
```bash
mvn clean install -DskipTests
```
*(Cờ `-DskipTests` được sử dụng để giảm thời gian build khi deploy. Tất cả test PHẢI vượt qua ở CI/CD pipeline trước đó).*

### Bước 3.2: Khởi chạy Microservices (Development Mode)
Để chạy toàn bộ hệ thống ở máy local tiện dụng, bạn có thể chạy file bat tự động.

Trên **Windows**, từ thư mục `services/`:
```cmd
run-all-services.bat
```
Script này sẽ tự động dò tìm các file `pom.xml` của 13 dịch vụ và bật 13 Terminal riêng biệt chạy `mvn spring-boot:run` cho từng dịch vụ.

**Thứ tự ưu tiên gợi ý khi start thủ công (nếu cần):**
1. `api-gateway` (cổng kết nối chung)
2. `identity-service` & `profile-service`
3. Phần còn lại (property, booking, etc.)

---

## 4. Frontend Web App Deployment (React / Next.js)

### Bước 4.1: Cấu hình Environment Variables (Frontend)
Chuyển vào thư mục web-app:
```bash
cd web-app
```
(Nếu có file `.env.example`, hãy copy thành `.env` tương tự như bước hạ tầng. Tuyệt đối không hardcode API Keys hoặc token bí mật ngoài file này).

### Bước 4.2: Cài đặt Dependencies
```bash
npm install
# hoặc yarn install
```

### Bước 4.3: Khởi chạy (Development)
Khởi chạy frontend:
```bash
npm start
# hoặc npm run dev (dành cho Next.js/Vite)
```
Ứng dụng sẽ hoạt động tại `http://localhost:3000` (hoặc cổng mà Terminal hiển thị).

### Bước 4.4: Build Production
Khi deploy lên server thật, chạy:
```bash
npm run build
```
Thư mục `build/` (hoặc `dist/`) sẽ được xuất ra, chứa HTML/CSS/JS tĩnh sẵn sàng đem đi serve bằng **Nginx, Vercel, hoặc S3/Storage**.

---

## 5. Security & QA Checklist (Bắt buộc trước khi Release)

Trước khi đem lên Production (Live App), đảm bảo các bước Agent Checklist sau đã được hoàn thành:

1. **Agent Audit**: Chạy `python .agent/scripts/checklist.py .` - Output phải 100% SUCCESS.
2. **Git status**: Đảm bảo CÁC FILE `.env` nằm trong `.gitignore` bằng lenh:
   `git check-ignore infra/.env web-app/.env` (Nó PHẢI trả ra kết quả có trong file `.gitignore`).
3. **Admin Routes**: Các UI route admin đã bật `RoleProtectedRoute`.
4. **Error Handling**: Không để lọt API stacktrace ra ngoài hoặc `console.log` log nhạy cảm ở client browsers.

---
*Tài liệu này được tạo bởi `@code-archaeologist` (Agent Kit).*
