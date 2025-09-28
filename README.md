# Roomie Backend - Hệ thống Quản lý và Cho thuê Phòng trọ

![Roomie Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=ROOMIE)

## 🏠 Giới thiệu
Roomie là một hệ thống quản lý và cho thuê phòng trọ hiện đại, được xây dựng với kiến trúc microservices để đảm bảo tính mở rộng và bảo trì dễ dàng.

## 🏗️ Kiến trúc Hệ thống
- **16 microservices** được thiết kế theo domain-driven design
- **Event-driven architecture** với Apache Kafka
- **Multiple databases**: MySQL, MongoDB, Neo4j, Redis
- **Service discovery** với Eureka Server
- **API Gateway** với Spring Cloud Gateway
- **Container orchestration** với Docker & Docker Compose

## 🔧 Các Microservices

### Core Services
- **api-gateway**: Cổng API chính, routing và load balancing
- **auth-service**: Xác thực và phân quyền người dùng
- **admin-service**: Quản lý hệ thống cho admin

### Business Services
- **property-service**: Quản lý thông tin bất động sản
- **booking-service**: Xử lý đặt phòng và lịch hẹn xem phòng
- **contract-service**: Quản lý hợp đồng thuê
- **payment-service**: Xử lý thanh toán và giao dịch
- **billing-service**: Quản lý hóa đơn và chi phí
- **maintenance-service**: Quản lý bảo trì và sửa chữa

### Support Services
- **profile-service**: Quản lý hồ sơ người dùng
- **chat-service**: Tin nhắn và giao tiếp real-time
- **notification-service**: Gửi thông báo đa kênh
- **file-service**: Quản lý file và media
- **search-service**: Tìm kiếm thông minh với Elasticsearch
- **review-service**: Đánh giá và feedback
- **analytics-service**: Phân tích dữ liệu và báo cáo

## 🚀 Quick Start

### Yêu cầu hệ thống
```bash
- Docker & Docker Compose v20+
- Java 17+
- Node.js 18+ (cho frontend)
- RAM: 8GB+
- Storage: 50GB+
```

### Khởi chạy nhanh
```bash
# Clone repository
git clone https://github.com/KrisCTer/roomie.git
cd roomie-backend

# Copy environment variables
cp .env.example .env

# Chỉnh sửa cấu hình trong .env file
nano .env

# Khởi động toàn bộ hệ thống
./scripts/start-all.sh

# Kiểm tra trạng thái services
./scripts/health-check.sh
```

### Truy cập hệ thống
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761
- **Grafana Monitoring**: http://localhost:3000
- **Kafka UI**: http://localhost:8090
- **MongoDB Express**: http://localhost:8081

## 🛠️ Development

### Khởi chạy từng service
```bash
# Khởi động infrastructure services trước
docker-compose up -d kafka mongodb mysql redis elasticsearch

# Khởi động service registry
./scripts/start-eureka.sh

# Khởi động từng business service
cd services/auth-service && ./mvnw spring-boot:run
cd services/property-service && ./mvnw spring-boot:run
# ... các service khác
```

### Testing
```bash
# Unit tests
./scripts/run-unit-tests.sh

# Integration tests
./scripts/run-integration-tests.sh

# End-to-end tests
./scripts/run-e2e-tests.sh
```

## 📊 Monitoring & Observability
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger distributed tracing
- **Health checks**: Spring Boot Actuator

## 🔐 Security
- **JWT Authentication** với refresh tokens
- **OAuth2** integration (Google, Facebook)
- **Rate limiting** tại API Gateway
- **CORS** configuration
- **Input validation** và sanitization

## 🌍 Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=roomie
DB_USER=roomie_user
DB_PASSWORD=secure_password

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_PREFIX=roomie

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400

# File Storage
FILE_STORAGE_PATH=/app/uploads
MAX_FILE_SIZE=10MB

# External APIs
PAYMENT_GATEWAY_KEY=your_payment_key
EMAIL_SERVICE_KEY=your_email_key
SMS_SERVICE_KEY=your_sms_key
```

## 📝 API Documentation
- **Swagger UI**: http://localhost:8080/swagger-ui/
- **API Docs**: [docs/API.md](docs/API.md)
- **Postman Collection**: [postman/roomie-api.json](postman/roomie-api.json)

## 🚢 Deployment
Xem chi tiết tại [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License
This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 📞 Support
- **Email**: support@roomie.vn
- **Documentation**: https://docs.roomie.vn
- **Issues**: https://github.com/your-org/roomie-backend/issues

## 🏆 Team
- **Backend Lead**: [Your Name]
- **DevOps**: [DevOps Lead]
- **Frontend**: [Frontend Lead]
- **Mobile**: [Mobile Lead]

---
Made with ❤️ by Roomie Team
