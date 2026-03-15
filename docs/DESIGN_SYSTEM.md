# Roomie Design System (Frontend)

Tài liệu này mô tả chi tiết cách hệ thống UI của dự án Roomie được phát triển, dựa trên sự kết hợp giữa **Material UI (MUI) v7** và **Tailwind CSS v3**.

---

## 1. Tech Stack UI

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| **React** | v18.x | View library, component lifecycle |
| **MUI** | v7.x | Cung cấp các complex components (DataGrid, Modal, DatePicker) |
| **Tailwind CSS** | v3.x | Cung cấp utility classes cho layout, spacing, typography, colors |
| **Lucide React** | v0.x | Icon library chính (nhẹ, SVG-based, thiết kế hiện đại) |

---

## 2. Chiến lược kết hợp (MUI + Tailwind)

Sự kết hợp giữa MUI và Tailwind mang lại sự linh hoạt (nhờ Tailwind) và tốc độ phát triển (nhờ các component xây sẵn của MUI). Tuy nhiên, để tránh xung đột CSS specificity (độ ưu tiên CSS), chúng ta áp dụng các nguyên tắc sau:

### 2.1 Nguyên tắc sử dụng
- **Dùng Tailwind cho Structure & Layout**: Dùng cho `div`, `span`, `main`, `section`, margin, padding, flexbox, grid, responsive design.
- **Dùng MUI cho Complex Components**: Dùng cho những component khó tự build từ đầu như `Accordion`, `Menu`, `Dialog`, `DataGrid`, `Snackbar`.
- **Hạn chế dùng `sx` prop của MUI**: Chỉ dùng `sx` khi không thể dùng Tailwind (ví dụ: style các class con nội bộ của MUI component).

### 2.2 Tránh xung đột CSS
Tailwind Core Plugins (như Preflight) có thể reset CSS làm hỏng style mặc định của MUI.
Phải bọc toàn bộ ứng dụng bằng thẻ `StyledEngineProvider` của MUI và cấu hình `injectFirst` để đảm bảo Tailwind classes luôn có độ ưu tiên cao hơn MUI mặc định.

```jsx
// src/App.js hoặc index.js
import { StyledEngineProvider } from '@mui/material/styles';

<StyledEngineProvider injectFirst>
  <App />
</StyledEngineProvider>
```

---

## 3. Colors & Typography (Theo Tailwind Config)

Toàn bộ màu sắc và font chữ phải tuân thủ Tailwind theme (không hardcode hex/rgb trong file JS).

### 3.1 Naming Convention
- **Theme Variables**: Sử dụng CSS Variables trong `index.css` để định nghĩa màu nền tảng.
- **Tailwind Extension**: Sử dụng `tailwind.config.js` để map các CSS Variables thành utility classes (ví dụ: `bg-primary-500`, `text-secondary-dark`).

### 3.2 Typography
- Dùng các utility `text-xs`, `text-sm`, `text-base`, `text-xl`, `font-bold` v.v. Không viết custom CSS font-size nếu không bắt buộc.

---

## 4. Cấu trúc Component

```
src/
├── components/
│   ├── common/           # Nơi chứa UI components dùng chung (Buttons, Inputs, Spinners)
│   ├── Billing/          # UI components đặc thù của 1 module
│   └── ChatBox/
```

### Quy tắc Component Clean Code
1. **Chia nhỏ UI**: Một file component không nên quá dài (khuyến nghị < 200 dòng cho UI). Nếu component có nhiều state phức tạp, hãy tách state logic ra Custom Hook.
2. **Không kết hợp Fetch Data trong UI Component**: (Tuân thủ Separation of Concerns). Component chỉ nhận `props` và render. Logic gọi API phải nằm ở Hook hoặc Service.

---

## 5. Xử lý Icon

Dự án ưu tiên dùng **Lucide React** thay vì FontAwesome hoặc MUI Icons để tối ưu bundle size và có tính nhất quán về độ dày nét (stroke-width).

```jsx
// CÁCH ĐÚNG
import { Home, User, Settings } from 'lucide-react';
<Home className="w-5 h-5 text-blue-500" />
```

---

## 6. Known Issues & Lưu ý

- **Bundle Size**: Cả MUI và Tailwind đều khá nặng. Tuân thủ triệt để rule import React.lazy() cho routing để chia nhỏ chunk file.
- **Dark Mode**: Nếu dự án bật Dark Mode, hãy dùng class `dark:` của Tailwind thay vì Theme custom của MUI để quản lý tập trung.

*Nếu có thắc mắc trong quá trình code UI, hãy hỏi Agent `@frontend-specialist`.*

---
---

# Roomie Design System (Backend)

Phần này mô tả các quy ước thiết kế, kiến trúc mã nguồn và naming convention cho toàn bộ 13 microservices (Java/Spring Boot) của dự án.

## 7. Cấu trúc Package (Package Structure)
Mỗi microservice tuân thủ cấu trúc phân tầng (Layered Architecture) tiêu chuẩn của Spring Boot để đảm bảo Separation of Concerns (SoC).

```
com.roomie.services.[service-name]
├── config/             # Cấu hình Spring, Security, Kafka, CORS
├── controller/         # REST Controllers (chỉ xử lý HTTP req/res, không chứa business logic)
├── dto/                # Data Transfer Objects (Request/Response payload)
├── entity/             # JPA/MongoDB Entities (ánh xạ database)
├── exception/          # Global Exception Handler (@ControllerAdvice) và custom exceptions
├── mapper/             # MapStruct interfaces (Entity <-> DTO)
├── repository/         # Spring Data Repositories
└── service/            # Business Logic Layers (Interfaces)
    └── impl/           # Implementations của Service Interfaces
```

## 8. REST API Conventions
Toàn bộ API của Roomie phải tuân thủ chuẩn RESTful:

### 8.1 Naming & Verbs
- Dùng **Nouns (Danh từ)** số nhiều cho resources, không dùng Verbs (Động từ).
  - ✅ ĐÚNG: `GET /api/properties`, `POST /api/users`
  - ❌ SAI: `GET /api/getAllProperties`, `POST /api/createUser`
- Trạng thái HTTP chuẩn xác:
  - `200 OK` (Thành công chung)
  - `201 Created` (Tạo mới thành công)
  - `400 Bad Request` (Client gửi data sai)
  - `401 Unauthorized` (Chưa đăng nhập / Token hết hạn)
  - `403 Forbidden` (Không đủ quyền Admin/Owner)
  - `404 Not Found` (Resource không tồn tại)
  - `500 Internal Server Error` (Bug server)

### 8.2 Standard Response Wrapper
Để Frontend dễ xử lý, mọi API response (cả thành công lẫn thất bại) nên được bọc trong một chuẩn chung (ApiResponse):

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "errors": null
}
```

## 9. Database & Naming Convention

### 9.1 Cơ sở dữ liệu
- **Tables (MySQL)**: Dùng **snake_case** và số nhiều (VD: `users`, `property_images`, `booking_transactions`).
- **Columns**: Dùng **snake_case** (VD: `created_at`, `owner_id`).
- **Collections (MongoDB)**: Dùng **camelCase** hoặc **snake_case** (nhất quán trong toàn service).

### 9.2 Java Code
- **Classes/Interfaces**: `PascalCase` (VD: `PropertyService`, `UserProfile`).
- **Variables/Methods**: `camelCase` (VD: `findById`, `totalAmount`).
- **Constants**: `UPPER_SNAKE_CASE` (VD: `MAX_UPLOAD_SIZE`, `DEFAULT_ROLE`).

## 10. Nguyên tắc lõi (Backend)
1. **Fat Service, Skinny Controller**: Controller chỉ nên dài 1-2 dòng (Gói data -> Gọi service -> Trả response). Mọi if/else logic nghiệp vụ phải nằm ở Service.
2. **DTO In/Out**: Tuyệt đối không trả `Entity` trực tiếp ra ngoài Controller để tránh expose dữ liệu nhạy cảm (như password) hoặc lỗi Lazy Initialization. Luôn dùng MapStruct chuyển Entity sang DTO.
3. **Fail-Closed Security**: Mặc định từ chối mọi truy cập API. Chỉ mở (PermitAll) cho các endpoint public (`/auth/login`, `/public/**`).

*Nếu có thắc mắc trong quá trình code Backend, hãy hỏi Agent `@backend-specialist`.*
