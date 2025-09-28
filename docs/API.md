# Roomie API Documentation

## 🔗 Base URLs
- **Development**: `http://localhost:8080/api`
- **Staging**: `https://api-staging.roomie.vn/api`
- **Production**: `https://api.roomie.vn/api`

## 🔐 Authentication
Tất cả API endpoints (trừ public endpoints) yêu cầu JWT token trong header:
```http
Authorization: Bearer {jwt_token}
```

## 📝 Common Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2024-01-15T10:30:00Z",
  "errors": []
}
```

Error Response:
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "timestamp": "2024-01-15T10:30:00Z",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🔑 Auth Service APIs

### POST /auth/register
Đăng ký tài khoản mới

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "Nguyen Van A",
  "phoneNumber": "+84901234567",
  "role": "TENANT" // TENANT, LANDLORD
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "role": "TENANT",
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

### POST /auth/login
Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### POST /auth/refresh-token
Làm mới access token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/forgot-password
Quên mật khẩu

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Đặt lại mật khẩu

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}
```

## 🏠 Property Service APIs

### GET /properties
Lấy danh sách bất động sản

**Query Parameters:**
```
page=0&size=20
&city=ho-chi-minh
&district=district-1
&minPrice=5000000
&maxPrice=15000000
&propertyType=APARTMENT
&amenities=WIFI,PARKING,AC
&sortBy=price
&sortDir=ASC
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "1",
        "title": "Căn hộ 2 phòng ngủ Quận 1",
        "description": "Căn hộ hiện đại, đầy đủ tiện nghi",
        "price": 10000000,
        "currency": "VND",
        "propertyType": "APARTMENT",
        "address": {
          "street": "123 Nguyễn Huệ",
          "district": "Quận 1",
          "city": "TP. Hồ Chí Minh",
          "latitude": 10.7769,
          "longitude": 106.7009
        },
        "images": [
          {
            "id": "img1",
            "url": "https://cdn.roomie.vn/images/property1-1.jpg",
            "thumbnailUrl": "https://cdn.roomie.vn/images/property1-1-thumb.jpg",
            "isPrimary": true
          }
        ],
        "amenities": ["WIFI", "AC", "PARKING", "SECURITY"],
        "availability": {
          "isAvailable": true,
          "availableFrom": "2024-02-01",
          "availableTo": "2024-12-31"
        },
        "owner": {
          "id": "owner1",
          "name": "Chú Tám",
          "avatar": "https://cdn.roomie.vn/avatars/owner1.jpg",
          "rating": 4.8
        },
        "stats": {
          "views": 1250,
          "bookmarks": 45,
          "rating": 4.6,
          "reviewCount": 23
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pageable": {
      "page": 0,
      "size": 20,
      "totalElements": 150,
      "totalPages": 8
    }
  }
}
```

### GET /properties/{id}
Lấy chi tiết bất động sản

**Response:**
```json
{
  "success": true,
  "data": {
    // ... property details (same as above)
    "detailedDescription": "Mô tả chi tiết về căn hộ...",
    "rules": [
      "Không hút thuốc trong nhà",
      "Không nuôi thú cưng",
      "Giữ yên lặng sau 22:00"
    ],
    "nearby": {
      "schools": ["Đại học Kinh tế", "Trường THPT Lê Quý Đôn"],
      "hospitals": ["Bệnh viện Chợ Rẫy"],
      "transportation": ["Bến xe Miền Đông", "Ga Metro Bến Thành"]
    }
  }
}
```

### POST /properties
Tạo bất động sản mới (Landlord only)

**Request Body:**
```json
{
  "title": "Căn hộ 2 phòng ngủ Quận 1",
  "description": "Căn hộ hiện đại, đầy đủ tiện nghi",
  "detailedDescription": "Mô tả chi tiết...",
  "price": 10000000,
  "propertyType": "APARTMENT",
  "address": {
    "street": "123 Nguyễn Huệ",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "zipCode": "70000"
  },
  "amenities": ["WIFI", "AC", "PARKING"],
  "rules": ["Không hút thuốc"],
  "availability": {
    "availableFrom": "2024-02-01",
    "availableTo": "2024-12-31"
  }
}
```

### PUT /properties/{id}
Cập nhật bất động sản

### DELETE /properties/{id}
Xóa bất động sản

### POST /properties/{id}/images
Upload ảnh cho bất động sản

**Request:** Multipart form-data
```
files: [File1, File2, File3]
isPrimary: [true, false, false]
```

## 🔍 Search Service APIs

### GET /search/properties
Tìm kiếm bất động sản nâng cao

**Query Parameters:**
```
q=căn hộ quận 1
&lat=10.7769&lon=106.7009&radius=5
&minPrice=5000000&maxPrice=15000000
&amenities=WIFI,PARKING
&sortBy=relevance
```

### GET /search/suggestions
Gợi ý tìm kiếm

**Query Parameters:**
```
q=căn hộ
&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "căn hộ quận 1",
      "căn hộ quận 2",
      "căn hộ cho thuê",
      "căn hộ giá rẻ"
    ]
  }
}
```

## 📅 Booking Service APIs

### GET /bookings
Lấy danh sách booking của user

**Query Parameters:**
```
status=CONFIRMED
&fromDate=2024-01-01
&toDate=2024-12-31
```

### GET /bookings/{id}
Lấy chi tiết booking

### POST /bookings
Tạo booking mới

**Request Body:**
```json
{
  "propertyId": "123",
  "checkInDate": "2024-02-01",
  "checkOutDate": "2024-02-28",
  "numberOfGuests": 2,
  "message": "Tôi muốn thuê phòng này",
  "totalAmount": 10000000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking123",
    "propertyId": "123",
    "userId": "user1",
    "status": "PENDING",
    "checkInDate": "2024-02-01",
    "checkOutDate": "2024-02-28",
    "numberOfGuests": 2,
    "totalAmount": 10000000,
    "paymentStatus": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "property": {
      "title": "Căn hộ 2 phòng ngủ Quận 1",
      "images": ["https://cdn.roomie.vn/images/property1-1.jpg"]
    }
  }
}
```

### PUT /bookings/{id}/confirm
Xác nhận booking (Landlord only)

### PUT /bookings/{id}/cancel
Hủy booking

**Request Body:**
```json
{
  "reason": "Thay đổi lịch trình",
  "cancelledBy": "TENANT" // TENANT, LANDLORD, SYSTEM
}
```

## 💳 Payment Service APIs

### GET /payments
Lấy lịch sử thanh toán

### GET /payments/{id}
Chi tiết thanh toán

### POST /payments
Tạo yêu cầu thanh toán

**Request Body:**
```json
{
  "bookingId": "booking123",
  "amount": 10000000,
  "paymentMethod": "VNPAY", // VNPAY, MOMO, BANKING, CASH
  "returnUrl": "https://roomie.vn/payment/success",
  "cancelUrl": "https://roomie.vn/payment/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment123",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "expiresAt": "2024-01-15T11:00:00Z"
  }
}
```

### POST /payments/webhook
Webhook xử lý kết quả thanh toán (Internal)

## 📄 Contract Service APIs

### GET /contracts
Lấy danh sách hợp đồng

### GET /contracts/{id}
Chi tiết hợp đồng

### POST /contracts
Tạo hợp đồng từ booking

**Request Body:**
```json
{
  "bookingId": "booking123",
  "templateId": "template1",
  "customTerms": [
    {
      "clause": "Điều khoản đặc biệt",
      "content": "Nội dung điều khoản"
    }
  ],
  "startDate": "2024-02-01",
  "endDate": "2024-08-01",
  "depositAmount": 5000000
}
```

### POST /contracts/{id}/sign
Ký hợp đồng điện tử

**Request Body:**
```json
{
  "signatureType": "DIGITAL", // DIGITAL, PHYSICAL
  "signatureData": "base64_signature_image"
}
```

### GET /contracts/{id}/download
Tải xuống hợp đồng PDF

## 💰 Billing Service APIs

### GET /bills
Lấy danh sách hóa đơn

### GET /bills/{id}
Chi tiết hóa đơn

### POST /bills
Tạo hóa đơn mới

**Request Body:**
```json
{
  "contractId": "contract123",
  "billType": "MONTHLY_RENT", // MONTHLY_RENT, UTILITIES, DEPOSIT, PENALTY
  "amount": 10000000,
  "dueDate": "2024-02-01",
  "description": "Tiền thuê tháng 2/2024",
  "lineItems": [
    {
      "description": "Tiền thuê nhà",
      "amount": 8000000
    },
    {
      "description": "Tiền điện nước",
      "amount": 2000000
    }
  ]
}
```

## 💬 Chat Service APIs

### GET /chats
Lấy danh sách cuộc trò chuyện

**Response:**
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "chat123",
        "participants": [
          {
            "userId": "user1",
            "name": "Nguyen Van A",
            "avatar": "https://cdn.roomie.vn/avatars/user1.jpg",
            "lastSeen": "2024-01-15T10:25:00Z"
          }
        ],
        "lastMessage": {
          "content": "Cho em xem phòng được không ạ?",
          "timestamp": "2024-01-15T10:30:00Z",
          "senderId": "user2"
        },
        "unreadCount": 2,
        "propertyId": "property123"
      }
    ]
  }
}
```

### GET /chats/{id}/messages
Lấy tin nhắn trong cuộc trò chuyện

**Query Parameters:**
```
page=0&size=50&before=messageId123
```

### POST /chats
Tạo cuộc trò chuyện mới

**Request Body:**
```json
{
  "participantId": "user2",
  "propertyId": "property123",
  "initialMessage": "Chào anh, em muốn hỏi về phòng này"
}
```

### POST /chats/{id}/messages
Gửi tin nhắn

**Request Body:**
```json
{
  "content": "Phòng này còn trống không ạ?",
  "messageType": "TEXT", // TEXT, IMAGE, FILE, LOCATION
  "metadata": {}
}
```

### WebSocket Connection
```javascript
// Connect to chat
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({
    'Authorization': 'Bearer ' + token
}, (frame) => {
    // Subscribe to personal messages
    stompClient.subscribe('/user/queue/messages', (message) => {
        const msg = JSON.parse(message.body);
        console.log('New message:', msg);
    });

    // Subscribe to chat room
    stompClient.subscribe('/topic/chat/' + chatId, (message) => {
        const msg = JSON.parse(message.body);
        console.log('Chat message:', msg);
    });
});

// Send message
stompClient.send('/app/chat/' + chatId + '/send', {}, JSON.stringify({
    content: 'Hello!',
    messageType: 'TEXT'
}));
```

## 📢 Notification Service APIs

### GET /notifications
Lấy thông báo của user

**Query Parameters:**
```
page=0&size=20&read=false&type=BOOKING
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "notif123",
        "type": "BOOKING_CONFIRMED",
        "title": "Booking được xác nhận",
        "content": "Booking #123 của bạn đã được chủ nhà xác nhận",
        "data": {
          "bookingId": "booking123",
          "propertyTitle": "Căn hộ 2 phòng ngủ"
        },
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

### PUT /notifications/{id}/read
Đánh dấu đã đọc

### PUT /notifications/read-all
Đánh dấu tất cả đã đọc

### GET /notifications/settings
Lấy cài đặt thông báo

### PUT /notifications/settings
Cập nhật cài đặt thông báo

**Request Body:**
```json
{
  "emailNotifications": {
    "bookingUpdates": true,
    "paymentReminders": true,
    "marketingEmails": false
  },
  "pushNotifications": {
    "messages": true,
    "bookingUpdates": true,
    "systemAlerts": true
  },
  "smsNotifications": {
    "bookingConfirmations": true,
    "paymentReminders": false
  }
}
```

## 👤 Profile Service APIs

### GET /profile
Lấy thông tin profile

### PUT /profile
Cập nhật profile

**Request Body:**
```json
{
  "fullName": "Nguyen Van A",
  "phoneNumber": "+84901234567",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "address": {
    "street": "123 Main St",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh"
  },
  "bio": "Mô tả bản thân",
  "preferences": {
    "currency": "VND",
    "language": "vi",
    "timezone": "Asia/Ho_Chi_Minh"
  }
}
```

### POST /profile/avatar
Upload avatar

**Request:** Multipart form-data
```
file: [Image file]
```

### POST /profile/documents
Upload documents (CCCD, passport, etc.)

### PUT /profile/verify-phone
Xác thực số điện thoại

**Request Body:**
```json
{
  "phoneNumber": "+84901234567",
  "verificationCode": "123456"
}
```

## ⭐ Review Service APIs

### GET /reviews/property/{propertyId}
Lấy đánh giá của bất động sản

### POST /reviews
Tạo đánh giá mới

**Request Body:**
```json
{
  "propertyId": "property123",
  "bookingId": "booking123",
  "rating": 4.5,
  "title": "Phòng đẹp, chủ nhà thân thiện",
  "content": "Phòng sạch sẽ, tiện nghi đầy đủ...",
  "aspects": {
    "cleanliness": 5,
    "accuracy": 4,
    "communication": 5,
    "location": 4,
    "value": 4
  },
  "images": ["review_image_1.jpg"]
}
```

### PUT /reviews/{id}
Cập nhật đánh giá

### DELETE /reviews/{id}
Xóa đánh giá

### POST /reviews/{id}/report
Báo cáo đánh giá

## 🔧 Maintenance Service APIs

### GET /maintenance-requests
Lấy danh sách yêu cầu bảo trì

### POST /maintenance-requests
Tạo yêu cầu bảo trì

**Request Body:**
```json
{
  "propertyId": "property123",
  "title": "Máy lạnh hỏng",
  "description": "Máy lạnh không lạnh, có tiếng kêu lạ",
  "priority": "HIGH", // LOW, MEDIUM, HIGH, URGENT
  "category": "HVAC", // HVAC, PLUMBING, ELECTRICAL, GENERAL
  "images": ["maintenance_image_1.jpg"]
}
```

### PUT /maintenance-requests/{id}/assign
Gán thợ sửa chữa

### PUT /maintenance-requests/{id}/complete
Hoàn thành công việc

## 📊 Analytics Service APIs

### GET /analytics/dashboard
Dashboard analytics cho landlord

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProperties": 12,
      "occupancyRate": 85.5,
      "monthlyRevenue": 120000000,
      "totalBookings": 45
    },
    "revenue": {
      "thisMonth": 120000000,
      "lastMonth": 110000000,
      "changePercent": 9.1
    },
    "bookings": {
      "thisMonth": 8,
      "pending": 3,
      "confirmed": 15,
      "cancelled": 2
    },
    "topProperties": [
      {
        "id": "prop1",
        "title": "Căn hộ Quận 1",
        "revenue": 25000000,
        "bookings": 3
      }
    ]
  }
}
```

### GET /analytics/property/{id}
Analytics cho bất động sản cụ thể

### GET /analytics/reports
Tạo báo cáo

**Query Parameters:**
```
type=REVENUE&period=MONTHLY&from=2024-01-01&to=2024-12-31
```

## 📎 File Service APIs

### POST /files/upload
Upload file

**Request:** Multipart form-data
```
file: [File]
category: PROPERTY_IMAGE // PROPERTY_IMAGE, AVATAR, DOCUMENT, CHAT_FILE
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "file123",
    "originalName": "image.jpg",
    "url": "https://cdn.roomie.vn/files/file123.jpg",
    "thumbnailUrl": "https://cdn.roomie.vn/files/file123_thumb.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

### GET /files/{id}
Download file

### DELETE /files/{id}
Xóa file

## ⚙️ Admin Service APIs

### GET /admin/users
Quản lý users (Admin only)

### GET /admin/properties/pending
Properties chờ duyệt

### PUT /admin/properties/{id}/approve
Duyệt property

### GET /admin/reports/flagged-content
Nội dung bị báo cáo

### GET /admin/analytics/system
System analytics

## 🚨 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Validation Error | Request validation failed |
| 429 | Rate Limited | Too many requests |
| 500 | Internal Error | Server error |

## 🔄 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|---------|
| /auth/* | 5 requests | 1 minute |
| /search/* | 100 requests | 1 minute |
| /properties | 60 requests | 1 minute |
| Default | 1000 requests | 1 hour |

## 📱 SDK & Libraries

### JavaScript/TypeScript
```bash
npm install @roomie/api-client
```

```javascript
import { RoomieAPI } from '@roomie/api-client';

const api = new RoomieAPI({
    baseURL: 'https://api.roomie.vn',
    apiKey: 'your_api_key'
});

// Get properties
const properties = await api.properties.list({
    city: 'ho-chi-minh',
    minPrice: 5000000
});

// Create booking
const booking = await api.bookings.create({
    propertyId: '123',
    checkInDate: '2024-02-01'
});
```

### Flutter/Dart
```dart
dependencies:
  roomie_api: ^1.0.0
```

## 🧪 Testing

### Postman Collection
Import collection từ: `https://api.roomie.vn/postman/collection.json`

### API Testing Environment
- **Sandbox**: `https://api-sandbox.roomie.vn`
- **Test Credentials**:
    - Email: `test@roomie.vn`
    - Password: `Test123!`

---

Để biết thêm chi tiết, tham khao:
- **Swagger UI**: https://api.roomie.vn/swagger-ui/
- **Developer Portal**: https://developers.roomie.vn
- **Support**: api-support@roomie.vn