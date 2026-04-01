# Roomie — Tổng Hợp Kiến Thức Dự Án

> Tài liệu toàn diện cho phỏng vấn & demo dự án.
> Cập nhật: 2026-04-01

---

## Mục Lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Chi tiết từng Microservice](#3-chi-tiết-từng-microservice)
4. [Database & Data Model](#4-database--data-model)
5. [Luồng xử lý chính (Business Flows)](#5-luồng-xử-lý-chính)
6. [Bảo mật & Authentication](#6-bảo-mật--authentication)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Giao tiếp giữa các service](#8-giao-tiếp-giữa-các-service)
9. [Infrastructure & DevOps](#9-infrastructure--devops)
10. [Các pattern & công nghệ cần nắm](#10-các-pattern--công-nghệ-cần-nắm)
11. [Câu hỏi phỏng vấn thường gặp](#11-câu-hỏi-phỏng-vấn-thường-gặp)
12. [Demo Script](#12-demo-script)

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
| **Frontend** | React, MUI, Tailwind CSS | React 19, MUI v7, Tailwind v3 |
| **Relational DB** | MySQL | 8.0 |
| **Document DB** | MongoDB | 7.0 |
| **Graph DB** | Neo4j | 5.15 |
| **Cache** | Redis | 7.2 |
| **Search Engine** | Elasticsearch | 8.11 |
| **Message Broker** | Apache Kafka | Confluent 7.5 |
| **Object Storage** | MinIO | S3-compatible |
| **Service Discovery** | Eureka | via Docker |
| **Monitoring** | Prometheus | v2.47 |
| **Containerization** | Docker Compose | — |

### Quy mô dự án

- **13 microservices** backend
- **1 React SPA** frontend
- **10 infrastructure services** (Docker Compose)
- **~60+ REST API endpoints**
- **Hỗ trợ đa ngôn ngữ** (i18n: Tiếng Việt + English)

---

## 2. Kiến Trúc Hệ Thống

### 2.1 Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                   │
│        MUI v7 + Tailwind CSS + React Router v7          │
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
│  MinIO │ Prometheus │ Eureka │ Zookeeper                 │
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

### 2.3 Tại sao dùng Microservices?

| Lý do | Giải thích |
|---|---|
| **Separation of Concerns** | Mỗi service chịu trách nhiệm 1 bounded context |
| **Independent Deployment** | Có thể deploy riêng từng service khi update |
| **Tech Diversity** | identity dùng MySQL (relational), còn lại dùng MongoDB (document) |
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

**Lý thuyết cần nắm:**
- JWT (JSON Web Token): structure (Header.Payload.Signature), signing, introspection
- OAuth2 Authorization Code Flow
- RBAC (Role-Based Access Control)
- Token invalidation (blacklist) với bảng `InvalidatedToken`
- Password hashing (BCrypt)

---

### 3.3 Profile Service (Port 8082)

**Vai trò:** Quản lý thông tin cá nhân mở rộng của user.

**Entity:** `UserProfile` (lưu trên **Neo4j** — graph database)

**Chức năng chính:**
- CRUD hồ sơ người dùng (avatar, họ tên, ngày sinh, giới tính)
- Quét CCCD/CMND qua QR code (`IDCardQRService`)
- Xác minh danh tính (ID card number, permanent address)
- Liên kết mối quan hệ user (Neo4j graph — chủ trọ ↔ người thuê)

**Tại sao dùng Neo4j?** Để model mối quan hệ giữa chủ trọ và người thuê (relationship graph), giúp query nhanh "ai đang thuê phòng của ai", "lịch sử thuê trọ".

**Kafka Consumer:** Lắng nghe `user-events` để tự động tạo profile khi user mới đăng ký.

**Lý thuyết cần nắm:**
- Graph Database: Node, Relationship, Cypher query language
- CQRS Pattern (identity quản lý auth, profile quản lý data)
- Event-Driven: Kafka consumer tạo profile tự động

---

### 3.4 Property Service (Port 8083)

**Vai trò:** Quản lý thông tin bất động sản/phòng trọ.

**Entities:** `Property`, `Address`, `Amenities`, `Media`, `Owner`, `Favorite`

**Chức năng chính:**
- CRUD thông tin phòng trọ (tiêu đề, mô tả, giá, diện tích, tiện nghi)
- Tìm kiếm toàn văn (full-text search) qua Elasticsearch
- Tìm theo giá, tỉnh thành, loại phòng
- Gắn label (Hot, Mới đăng)
- Quản lý danh sách yêu thích (Favorites)
- Duyệt/Từ chối (Approval workflow)

**Enums quan trọng:**
- `PropertyType`: ROOM, APARTMENT, HOUSE...
- `PropertyStatus`: AVAILABLE, RENTED, MAINTENANCE
- `ApprovalStatus`: PENDING, APPROVED, REJECTED
- `PropertyLabel`: HOT, NEW, RECOMMENDED

**Tại sao dùng Elasticsearch?** Full-text search tiếng Việt, fuzzy matching, geo-search. MongoDB text index không mạnh bằng.

**Lý thuyết cần nắm:**
- Elasticsearch indexing, mapping, full-text search
- MongoDB document modeling (embedded vs referenced)
- Redis caching strategy (cache property list, invalidate on update)

---

### 3.5 Booking Service (Port 8084)

**Vai trò:** Quản lý đặt phòng dài hạn.

**Entity:** `LeaseLongTerm`

**Chức năng chính:**
- Tạo booking (tenant đặt phòng)
- Landlord approve/reject booking
- Redis distributed lock (tránh double booking)
- Publish Kafka events khi booking thay đổi trạng thái

**Enums:** `LeaseStatus`: PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED, COMPLETED

**Lý thuyết cần nắm:**
- Distributed Lock (Redis SETNX) — tránh 2 người book cùng phòng
- Event Sourcing / Event-driven: booking created → contract service lắng nghe

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

**Flow ký hợp đồng:**
1. Hệ thống tạo hợp đồng → gửi OTP qua email
2. Tenant nhập OTP → `tenantSigned = true`
3. Landlord nhập OTP → `landlordSigned = true`
4. Cả hai đã ký → contract ACTIVE → publish Kafka event

**Lý thuyết cần nắm:**
- Digital Signature (HMAC-SHA256)
- OTP verification flow
- Optimistic Locking (`@Version` annotation) — tránh concurrent update
- PDF generation (iText hoặc thư viện tương tự)

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
- Tích hợp MoMo payment
- QR Code thanh toán

**Enums:** `BillStatus`: PENDING, PAID, OVERDUE, CANCELLED

**Cron Job:** Tự kiểm tra hóa đơn quá hạn hàng ngày (`overdue-check-cron: 0 0 3 * * *`)

**Lý thuyết cần nắm:**
- OCR (Optical Character Recognition) — đọc chỉ số đồng hồ từ ảnh
- Cron Job scheduling trong Spring Boot (`@Scheduled`)
- BigDecimal cho tính toán tiền tệ (không dùng double/float)

---

### 3.8 Payment Service (Port 8087)

**Vai trò:** Xử lý thanh toán online.

**Entity:** `Payment`

**Chức năng chính:**
- Tích hợp VNPay (cổng thanh toán ngân hàng)
- Tích hợp MoMo (ví điện tử)
- Webhook nhận callback từ payment gateway
- Cập nhật trạng thái bill/contract sau thanh toán thành công

**Payment Flow:**
1. User chọn hóa đơn → chọn phương thức (VNPay/MoMo)
2. Backend tạo payment URL → redirect user tới payment gateway
3. User thanh toán → gateway callback webhook
4. Backend verify + update trạng thái → publish Kafka event

**Lý thuyết cần nắm:**
- Payment Gateway integration (redirect flow, webhook/IPN callback)
- Signature verification (HMAC) để chống giả mạo callback
- Idempotency (xử lý webhook trùng lặp)

---

### 3.9 File Service (Port 8088)

**Vai trò:** Quản lý upload/download file (ảnh, tài liệu, PDF).

**Entity:** `FileMgmt`

**Chức năng chính:**
- Upload file lên MinIO (S3-compatible object storage)
- Download/serve file qua API
- Cleanup file hết hạn (`FileCleanupTask`)
- Hỗ trợ multipart upload

**Tại sao dùng MinIO?** S3-compatible API, self-hosted, không phụ thuộc cloud provider. Có thể migrate sang AWS S3 dễ dàng.

---

### 3.10 Chat Service (Port 8089)

**Vai trò:** Real-time messaging giữa tenant và landlord.

**Entities:** `ChatMessage`, `Conversation`, `ParticipantInfo`, `WebSocketSession`

**Chức năng chính:**
- Tạo/quản lý conversation
- Gửi/nhận tin nhắn real-time qua WebSocket (Socket.IO)
- Lưu trữ lịch sử chat

**Lý thuyết cần nắm:**
- WebSocket protocol (full-duplex communication)
- Socket.IO (auto-reconnect, fallback to long-polling)
- Message persistence (lưu MongoDB, serve qua REST API + real-time qua WebSocket)

---

### 3.11 Notification Service (Port 8090)

**Vai trò:** Hệ thống thông báo đa kênh.

**Entities:** `Notification`, `NotificationTemplate`

**Chức năng chính:**
- Nhận Kafka events từ các service khác (booking, contract, payment, property)
- Gửi thông báo qua: Email, WebSocket (real-time push), In-app
- Template-based notifications
- Lịch dọn dẹp notification cũ (retention 90 ngày)
- Thống kê (đã đọc/chưa đọc)

**Kafka Consumers:** Lắng nghe topics: `BookingEvent`, `ContractEvent`, `PaymentEvent`, `PropertyEvent`, `MessageEvent`

**Lý thuyết cần nắm:**
- Event-driven notification (Kafka consumer → action)
- Template pattern cho email/notification content
- WebSocket push notification

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
- Dashboard thống kê

**Kafka Consumer:** `UserActivityConsumer` — ghi log hoạt động user từ các service.

---

## 4. Database & Data Model

### 4.1 Tại sao dùng Polyglot Persistence?

| Database | Dùng cho | Lý do |
|---|---|---|
| **MySQL** | User, Role, Permission | Quan hệ Many-to-Many cần ACID transaction + JOIN |
| **MongoDB** | Property, Contract, Bill, Payment, Chat... | Schema linh hoạt, embedded documents, horizontal scaling |
| **Neo4j** | UserProfile + relationships | Graph traversal nhanh cho relationship queries |
| **Redis** | Cache, distributed lock, session | In-memory → cực nhanh cho caching và locking |
| **Elasticsearch** | Property search index | Full-text search, fuzzy matching, aggregation |
| **MinIO** | File/image storage | S3-compatible object storage, self-hosted |

### 4.2 Các Entity chính

```
User (MySQL - identity)
├── id (UUID)
├── username, email, phoneNumber (unique)
├── password (BCrypt hashed)
├── emailVerified, isActive, isBanned
├── authProvider (local/google/facebook)
└── roles → Set<Role> (Many-to-Many)

UserProfile (Neo4j - profile)
├── id, userId (link to User)
├── firstName, lastName, avatar
├── gender, dob
├── idCardNumber, permanentAddress
└── status (AccountStatus)

Property (MongoDB - property)
├── propertyId
├── title, description
├── address (embedded: province, district, ward, street)
├── monthlyRent, rentalDeposit (BigDecimal)
├── propertyType, propertyStatus, propertyLabel
├── size, rooms, bedrooms, bathrooms
├── amenities (embedded: wifi, aircon, parking...)
├── mediaList (embedded: url, type)
├── owner (embedded: userId, name, phone)
└── status (ApprovalStatus: PENDING/APPROVED/REJECTED)

LeaseLongTerm (MongoDB - booking)
├── id, propertyId, landlordId, tenantId
├── leaseStart, leaseEnd
├── monthlyRent, rentalDeposit
└── status (LeaseStatus)

Contract (MongoDB - contract)
├── id, bookingId, propertyId, tenantId, landlordId
├── startDate, endDate
├── monthlyRent, rentalDeposit
├── tenantSigned, landlordSigned
├── pdfUrl, signatureToken
├── status (ContractStatus)
└── version (Optimistic Lock)

Bill (MongoDB - billing)
├── id, contractId, landlordId, tenantId, propertyId
├── monthlyRent
├── electricity (old/new/consumption/unitPrice/amount)
├── water (old/new/consumption/unitPrice/amount)
├── internet/parking/cleaning/maintenance prices
├── totalAmount, billingMonth, dueDate
└── status (BillStatus)

Payment (MongoDB - payment)
├── id, userId, bookingId, contractId, billId
├── amount, method (VNPAY/MOMO/CASH)
├── status (PENDING/PROCESSING/COMPLETED/FAILED)
├── transactionId, paymentUrl
└── paidAt
```

---

## 5. Luồng Xử Lý Chính

### 5.1 Flow: Đăng ký → Tìm phòng → Thuê phòng (End-to-End)

```
1. ĐĂNG KÝ
   User → POST /identity/users/register
   └→ Identity tạo User (MySQL) + publish Kafka "user-events"
   └→ Profile Service consumer → tạo UserProfile (Neo4j)

2. ĐĂNG TIN (Landlord)
   Landlord → POST /property/properties (tạo tin)
   └→ Upload ảnh qua /file/media/upload → MinIO
   └→ Property lưu MongoDB (status: PENDING)
   └→ Admin duyệt → APPROVED → xuất hiện trên search

3. TÌM PHÒNG (Tenant)
   Tenant → GET /property/properties/search?q=...
   └→ Elasticsearch full-text search → return danh sách property

4. ĐẶT PHÒNG
   Tenant → POST /booking/leases (tạo booking)
   └→ Redis lock tránh double booking
   └→ Booking status: PENDING_APPROVAL
   └→ Kafka event → Notification cho Landlord

5. DUYỆT BOOKING
   Landlord → PUT /booking/leases/{id}/approve
   └→ Status: APPROVED
   └→ Kafka event → Contract Service tạo hợp đồng

6. KÝ HỢP ĐỒNG
   Hệ thống tạo Contract → gửi OTP email
   Tenant ký (nhập OTP) → Landlord ký (nhập OTP)
   └→ Contract ACTIVE → sinh PDF → upload file-service
   └→ Kafka event → Billing tạo hóa đơn tháng đầu

7. THANH TOÁN
   Landlord tạo Bill hàng tháng (tiền phòng + điện + nước)
   Tenant → POST /payment/create (chọn VNPay/MoMo)
   └→ Redirect tới payment gateway → thanh toán
   └→ Webhook callback → update bill PAID
   └→ Kafka event → Notification cho cả 2 bên
```

### 5.2 Flow: Admin duyệt tin đăng

```
Landlord đăng tin → status: PENDING
Admin → GET /admin/properties (list pending)
Admin → PUT /admin/properties/{id}/approve hoặc reject
└→ Kafka event → Notification cho Landlord
```

### 5.3 Flow: Chat real-time

```
Tenant mở chat → WebSocket connect (Socket.IO)
Tenant gửi tin nhắn → POST /chat/messages
└→ Lưu MongoDB + broadcast qua WebSocket
Landlord nhận tin nhắn real-time
```

---

## 6. Bảo Mật & Authentication

### 6.1 JWT Authentication Flow

```
1. Login: POST /identity/auth/token
   → Verify credentials → Generate JWT (HMAC-SHA)
   → Return { accessToken, refreshToken }

2. Mỗi request tiếp theo:
   → Frontend gửi Header: Authorization: Bearer <token>
   → API Gateway intercept → gọi /identity/auth/introspect
   → Token valid? → forward request | Token invalid → 401

3. Token Refresh:
   → POST /identity/auth/refresh-token
   → Return new accessToken

4. Logout:
   → POST /identity/auth/logout
   → Add token vào bảng InvalidatedToken (blacklist)
```

### 6.2 Authorization (RBAC)

| Role | Quyền |
|---|---|
| **TENANT** | Tìm phòng, booking, ký hợp đồng, xem hóa đơn, thanh toán, chat |
| **LANDLORD** | Tất cả của tenant + đăng tin, quản lý phòng, tạo hóa đơn, cấu hình tiện ích |
| **ADMIN** | Duyệt property, quản lý user, xem log, cấu hình hệ thống |

**Frontend guard:** `RoleProtectedRoute` component kiểm tra role trước khi render page.
**Backend guard:** `SecurityConfig` + `CustomJwtDecoder` kiểm tra JWT claims.

### 6.3 Verification Guard

Một số trang yêu cầu user đã xác minh CCCD (`VerificationGuard`):
- Profile, Message, Dashboard, Booking, Contract, Billing, Add Property...

### 6.4 OAuth2 Social Login

- Google OAuth2: Authorization Code Flow
- Facebook OAuth2: Authorization Code Flow
- Redirect URI: `http://localhost:3000/oauth2/callback`
- `OAuth2SuccessHandler` xử lý callback, tạo/link user, phát JWT

---

## 7. Frontend Architecture

### 7.1 Cấu trúc thư mục

```
frontend/src/
├── components/          # UI components
│   ├── common/          # Button, Input, Spinner, Guards
│   ├── layout/          # Header, Sidebar, Footer (3 layouts)
│   │   ├── layoutAdmin/ # Admin panel layout
│   │   ├── layoutHome/  # Public pages layout
│   │   └── layoutUser/  # Authenticated user layout
│   ├── Billing/         # Bill components
│   ├── Booking/         # Booking components
│   ├── ChatBox/         # Chat UI
│   ├── Contracts/       # Contract + signing components
│   ├── Dashboard/       # User dashboard
│   ├── Notification/    # Notification bell, list
│   ├── Profile/         # Profile editor
│   ├── Property/        # Property card, form
│   ├── PropertyDetail/  # Property detail page
│   └── PropertySearch/  # Search filters, results
├── contexts/            # React Context (Auth, Theme...)
├── hooks/               # Custom hooks
├── i18n/                # Internationalization (vi/ en/)
├── pages/               # Page-level components
├── routes/              # AppRoutes.jsx
├── services/            # API service layer (Axios)
├── styles/              # Global CSS
└── utils/               # Utility functions
```

### 7.2 Các trang chính

| Route | Component | Quyền | Mô tả |
|---|---|---|---|
| `/` | Home | Public | Trang chủ, danh sách phòng nổi bật |
| `/search` | PropertySearch | Public | Tìm kiếm phòng với bộ lọc |
| `/property/:id` | PropertyDetail | Public | Chi tiết phòng trọ |
| `/login` | Login | Public | Đăng nhập |
| `/register` | Register | Public | Đăng ký |
| `/profile` | Profile | Login + Verified | Quản lý hồ sơ |
| `/dashboard` | Dashboard | Tenant/Landlord | Tổng quan cá nhân |
| `/my-bookings` | MyBookings | Tenant/Landlord | Danh sách booking |
| `/my-contracts` | MyContracts | Tenant/Landlord | Danh sách hợp đồng |
| `/contract-signing/:id` | ContractSigning | Tenant/Landlord | Ký hợp đồng |
| `/unified-bills` | UnifiedBillsPage | Tenant/Landlord | Danh sách hóa đơn |
| `/add-property` | AddProperty | Landlord | Đăng tin mới |
| `/my-properties` | MyProperties | Landlord | Quản lý tin đăng |
| `/admin/*` | Admin pages | Admin | Quản trị hệ thống |
| `/message` | Message | Login + Verified | Chat |
| `/my-favorites` | MyFavorites | Login | Phòng yêu thích |

### 7.3 Chiến lược MUI + Tailwind

- **Tailwind**: Layout, spacing, responsive, typography
- **MUI**: Complex components (Dialog, DataGrid, DatePicker, Accordion)
- `StyledEngineProvider injectFirst` để tránh CSS specificity conflict
- **Lucide React** cho icon (nhẹ hơn MUI Icons)

### 7.4 Code Splitting

Toàn bộ pages sử dụng `React.lazy()` + `Suspense` → code splitting tự động → giảm initial bundle size.

---

## 8. Giao Tiếp Giữa Các Service

### 8.1 Synchronous (REST — OpenFeign)

Khi service A cần data ngay lập tức từ service B:

```
booking-service → ProfileClient.getProfile(userId)  → profile-service
booking-service → PropertyClient.getProperty(id)    → property-service
contract-service → PropertyClient, ProfileClient, BillingClient, FileClient
billing-service → ContractClient, PropertyClient, FileClient
payment-service → BillClient, ContractClient, ProfileClient, FileClient
admin-service → UserClient (identity), PropertyClient
```

**Công nghệ:** Spring Cloud OpenFeign — declarative REST client.
`AuthenticationRequestInterceptor` tự động forward JWT token khi gọi cross-service.

### 8.2 Asynchronous (Event-driven — Kafka)

Khi service A chỉ cần thông báo, không cần response:

```
identity-service  → "user-events"      → profile-service (tạo profile)
booking-service   → "BookingEvent"     → notification-service (thông báo)
contract-service  → "ContractEvent"    → notification-service + billing-service
payment-service   → "PaymentEvent"     → notification-service + contract-service
property-service  → "PropertyEvent"    → notification-service
```

**Lý thuyết cần nắm:**
- Kafka: Topic, Producer, Consumer, Consumer Group
- At-least-once delivery (cần idempotent consumer)
- `JsonSerializer` / `JsonDeserializer` cho event objects

---

## 9. Infrastructure & DevOps

### 9.1 Docker Compose Services

```yaml
mongodb:        mongo:7.0             # Document DB
mysql:          mysql:8.0             # Relational DB
neo4j:          neo4j:5.15            # Graph DB
redis:          redis:7.2-alpine      # Cache + Lock
kafka:          cp-kafka:7.5.0        # Message Broker
zookeeper:      cp-zookeeper:7.5.0    # Kafka coordination
elasticsearch:  elasticsearch:8.11.0  # Search Engine
minio:          minio:RELEASE.2024    # Object Storage
prometheus:     prom/prometheus:v2.47  # Metrics
eureka-server:  eureka-server         # Service Discovery
```

### 9.2 Build & Run

```bash
# 1. Start infrastructure
cd infra && docker-compose --env-file .env up -d

# 2. Build all 13 services
cd backend && mvn clean install -DskipTests

# 3. Run backend (Windows)
infra\scripts\backend-runtime\run-from-jars.bat

# 4. Run frontend
cd frontend && npm install && npm start
```

### 9.3 Health Check

```
GET http://localhost:<PORT><CONTEXT_PATH>/actuator/health

Ví dụ:
GET http://localhost:8082/profile/actuator/health
```

3 trạng thái: **HEALTHY** (200) | **DEGRADED** (503, service OK nhưng dependency DOWN) | **OFFLINE** (unreachable)

---

## 10. Các Pattern & Công Nghệ Cần Nắm

### 10.1 Design Patterns

| Pattern | Nơi áp dụng | Giải thích |
|---|---|---|
| **API Gateway** | api-gateway | Single entry point, cross-cutting concerns |
| **CQRS** | identity ↔ profile | Command (identity) tách riêng Query (profile) |
| **Event-Driven** | Kafka events | Loose coupling giữa services |
| **Repository** | Spring Data JPA/MongoDB | Data access abstraction |
| **DTO** | Request/Response objects | Không expose entity trực tiếp |
| **Mapper** | MapStruct interfaces | Entity ↔ DTO conversion tự động |
| **Builder** | Lombok `@Builder` | Fluent object creation |
| **Template Method** | Notification templates | Tái sử dụng cấu trúc notification |
| **Strategy** | Payment (VNPay/MoMo) | Nhiều phương thức thanh toán |
| **Distributed Lock** | Redis lock (booking) | Tránh race condition |
| **Optimistic Lock** | Contract `@Version` | Tránh concurrent update |
| **Circuit Breaker** | OpenFeign | Resilience khi service DOWN |

### 10.2 Thư viện & Framework quan trọng

| Thư viện | Vai trò | Ghi chú |
|---|---|---|
| **Spring Boot** | Framework chính | Auto-configuration, dependency injection |
| **Spring Cloud Gateway** | API Gateway | Reactive, WebFlux |
| **Spring Security** | Security framework | JWT + OAuth2 |
| **Spring Data JPA** | ORM cho MySQL | Hibernate underneath |
| **Spring Data MongoDB** | MongoDB access | MongoRepository |
| **Spring Data Neo4j** | Neo4j access | Cypher queries |
| **Spring Data Redis** | Cache + Lock | `@Cacheable`, `RedisTemplate` |
| **Spring Data Elasticsearch** | Search | `ElasticsearchRepository` |
| **Spring Kafka** | Message broker | `@KafkaListener`, `KafkaTemplate` |
| **OpenFeign** | HTTP client | Declarative REST calls |
| **MapStruct** | Object mapping | Compile-time DTO ↔ Entity mapper |
| **Lombok** | Boilerplate reduction | `@Data`, `@Builder`, `@Slf4j` |
| **JJWT** | JWT handling | Token signing & parsing |
| **Springdoc OpenAPI** | API documentation | Swagger UI (dev profile only) |

### 10.3 Key Annotations cần nhớ

```java
// Spring Boot
@SpringBootApplication, @RestController, @Service, @Repository
@Configuration, @Component, @Bean

// Security
@PreAuthorize, @EnableWebSecurity

// Data
@Entity, @Table, @Column, @Id, @GeneratedValue (JPA)
@Document, @MongoId (MongoDB)
@Node, @Property (Neo4j)
@Cacheable, @CacheEvict (Redis)

// Validation
@Valid, @NotNull, @NotBlank, @Size, @Email

// Lombok
@Data, @Getter, @Setter, @Builder, @NoArgsConstructor
@AllArgsConstructor, @FieldDefaults, @Slf4j

// Kafka
@KafkaListener, @EnableKafka

// Feign
@FeignClient, @RequestMapping

// MapStruct
@Mapper(componentModel = "spring")
```

---

## 11. Câu Hỏi Phỏng Vấn Thường Gặp

### 11.1 Câu hỏi tổng quan

**Q1: Giới thiệu tổng quan dự án Roomie.**
> Roomie là nền tảng quản lý cho thuê phòng trọ, xây dựng theo kiến trúc microservices với 13 service backend (Spring Boot), frontend React, sử dụng polyglot persistence (MySQL, MongoDB, Neo4j), Kafka cho event-driven communication, Elasticsearch cho full-text search, Redis cho caching và distributed lock.

**Q2: Tại sao chọn microservices thay vì monolith?**
> - Dự án có nhiều bounded context rõ ràng (auth, property, booking, payment...)
> - Cần khả năng scale riêng từng service (property search traffic cao hơn payment)
> - Team có thể develop & deploy independent
> - Có thể dùng different database per service (MySQL cho identity vì cần ACID, MongoDB cho property vì schema linh hoạt)

**Q3: Dự án dùng bao nhiêu database? Tại sao không dùng 1 database duy nhất?**
> 5 loại DB. Mỗi loại phù hợp cho use case khác nhau. Đây gọi là Polyglot Persistence. MySQL cho auth (ACID + JOIN), MongoDB cho domain data (schema linh hoạt), Neo4j cho graph giữa user (relationship traversal nhanh), Redis cho cache (in-memory speed), Elasticsearch cho search (full-text, fuzzy, aggregation).

### 11.2 Câu hỏi kỹ thuật

**Q4: JWT hoạt động như thế nào trong Roomie?**
> JWT gồm 3 phần: Header (algorithm), Payload (userId, roles, exp), Signature (HMAC-SHA256 với secret key). Identity service phát JWT khi login, API Gateway verify bằng cách gọi introspect endpoint. Token invalidation xử lý bằng blacklist table (InvalidatedToken). Refresh token cho phép lấy access token mới mà không cần login lại.

**Q5: Giải thích flow thanh toán online.**
> User chọn bill → chọn phương thức (VNPay/MoMo) → backend tạo payment request với signature → redirect user tới payment gateway → user thanh toán → gateway POST webhook callback → backend verify signature → update payment + bill status → publish Kafka event → notification service gửi thông báo.

**Q6: Distributed Lock dùng ở đâu và tại sao?**
> Dùng Redis SETNX trong booking-service để tránh 2 người cùng book 1 phòng (double booking). Khi tenant click "Book", hệ thống acquire lock trên propertyId trong 15 phút. Nếu lock thành công → cho phép booking. Nếu không → trả về lỗi "phòng đang được xử lý".

**Q7: Elasticsearch dùng cho gì? So sánh với MongoDB text search.**
> ES dùng cho full-text search property (tìm theo tên, mô tả, địa chỉ). ES mạnh hơn MongoDB text index ở: fuzzy matching (tìm "pòng trọ" → "phòng trọ"), relevance scoring, aggregation (statistics), synonym handling, analyzer cho tiếng Việt.

**Q8: Kafka dùng ở đâu? Tại sao không dùng REST API trực tiếp?**
> Kafka dùng cho async communication: khi booking approved → notify contract service + notification service. Dùng Kafka thay vì REST vì: (1) loose coupling — booking service không cần biết notification service tồn tại, (2) reliability — message được persist, nếu consumer down sẽ xử lý sau, (3) scalability — nhiều consumer có thể xử lý song song.

**Q9: Giải thích cách ký hợp đồng điện tử hoạt động.**
> Contract được tạo → hệ thống gửi OTP qua email cho tenant → tenant nhập OTP → verify → đánh dấu tenantSigned. Tương tự cho landlord. Sau khi cả 2 ký → sinh PDF với HMAC signature (chống giả mạo) → upload lên MinIO qua file-service → contract ACTIVE.

**Q10: Giải thích Optimistic Locking trong contract-service.**
> Entity Contract có field `@Version`. Khi 2 request cùng update 1 contract, request đầu thành công (version 0 → 1), request thứ 2 fail vì version đã thay đổi → throw `OptimisticLockException` → retry hoặc trả lỗi. Tránh mất dữ liệu khi concurrent update.

### 11.3 Câu hỏi về Frontend

**Q11: Frontend dùng pattern gì để gọi API?**
> Service layer pattern: `services/authService.js`, `services/propertyService.js`... Mỗi file tương ứng 1 backend service. Dùng Axios instance với baseURL = API Gateway. Interceptor tự động gắn JWT token vào mỗi request. Response interceptor handle 401 → redirect login.

**Q12: Code splitting được áp dụng như thế nào?**
> Tất cả page components dùng `React.lazy()` + `Suspense`. Mỗi route được split thành chunk riêng → user chỉ download code cho page đang xem. Giảm initial bundle size đáng kể.

**Q13: Giải thích hệ thống phân quyền ở Frontend.**
> `RoleProtectedRoute` component wrap protected routes, kiểm tra JWT decoded roles. `VerificationGuard` kiểm tra thêm user đã xác minh CCCD chưa. Combine cả 2 cho các trang quan trọng (ký hợp đồng, thanh toán...).

### 11.4 Câu hỏi Architecture & Design

**Q14: Giải thích CQRS pattern trong dự án.**
> Identity service quản lý Write (register, update password, role) — dùng MySQL vì cần ACID transaction. Profile service quản lý Read/Update profile data — dùng Neo4j vì cần graph queries. 2 service sync qua Kafka event: khi user register → identity publish event → profile consumer tạo UserProfile. Tách riêng giúp optimize từng service cho use case riêng.

**Q15: Làm sao đảm bảo data consistency giữa các service?**
> Eventual Consistency qua Kafka events. Ví dụ: payment complete → publish event → billing update bill status. Nếu consumer fail → Kafka retain message → retry. Cho case critical (payment), có thể check lại bằng REST call. Trade-off: không có strong consistency nhưng đổi lại loosely coupled + resilient.

**Q16: Nếu 1 service bị DOWN, hệ thống xử lý thế nào?**
> OpenFeign có timeout + fallback. Kafka messages được persist → consumer xử lý khi service up lại. API Gateway trả lỗi 503 cho route tương ứng nhưng không ảnh hưởng các service khác. Health check script phân biệt HEALTHY / DEGRADED / OFFLINE.

---

## 12. Demo Script

### 12.1 Demo Flow gợi ý (10 phút)

1. **[1 phút] Giới thiệu kiến trúc** — show sơ đồ hệ thống, giải thích microservices
2. **[1 phút] Start hệ thống** — `docker-compose up`, run services, health check
3. **[1 phút] Đăng ký + Đăng nhập** — register → OTP verify → login → JWT token
4. **[1 phút] Xác minh CCCD** — quét QR CCCD → điền thông tin
5. **[2 phút] Landlord đăng tin** — tạo property → upload ảnh → admin duyệt
6. **[1 phút] Tenant tìm phòng** — tìm kiếm → bộ lọc → xem chi tiết
7. **[1 phút] Booking + Ký hợp đồng** — đặt phòng → duyệt → ký OTP → PDF
8. **[1 phút] Hóa đơn + Thanh toán** — landlord tạo bill → tenant thanh toán VNPay/MoMo
9. **[1 phút] Chat + Notification** — nhắn tin real-time + push notification

### 12.2 Các điểm highlight khi demo

- **Real-time chat** qua WebSocket
- **OCR đọc đồng hồ** từ ảnh chụp
- **Ký hợp đồng điện tử** với OTP
- **Thanh toán online** VNPay/MoMo
- **Full-text search** tiếng Việt
- **AI Chatbot** tư vấn phòng
- **Admin panel** real-time log
- **i18n** chuyển đổi Tiếng Việt / English

---

> **Ghi nhớ quan trọng:** Luôn sẵn sàng giải thích **TẠI SAO** chọn công nghệ X thay vì Y, không chỉ biết **đã dùng gì**. Phỏng vấn viên đánh giá khả năng tư duy kiến trúc, không chỉ coding.
