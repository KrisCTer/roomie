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
    "checkOutDate":