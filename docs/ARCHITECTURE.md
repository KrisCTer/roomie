# Roomie System Architecture

## 🏗️ Overview
Roomie sử dụng kiến trúc microservices với event-driven communication để xây dựng một hệ thống quản lý và cho thuê phòng trọ có khả năng mở rộng cao.

## 📐 Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile App     │    │   Admin Panel   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                ┌────────────────▼─────────────────┐
                │           API Gateway            │
                │     (Spring Cloud Gateway)       │
                └────────────────┬─────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
    ┌───────▼──────┐    ┌────────▼─────┐    ┌─────────▼────────┐
    │ Auth Service │    │ Admin Service│    │Property Service  │
    └──────┬───────┘    └──────────────┘    └───────┬──────────┘
           │                                        │
    ┌──────▼────────────────────────────────────────▼─────┐
    │              Event Bus (Apache Kafka)               │
    └────────────────────┬────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼────┐         ┌─────▼─────┐       ┌──────▼──────┐
│Booking │         │ Payment   │       │   Chat      │
│Service │         │ Service   │       │   Service   │
└────────┘         └───────────┘       └─────────────┘
```

## 🔧 Microservices Architecture

### 1. API Gateway
**Technology**: Spring Cloud Gateway
**Responsibilities**:
- Request routing và load balancing
- Authentication và authorization
- Rate limiting và throttling
- Request/Response transformation
- Circuit breaker pattern
- CORS handling

**Key Features**:
```yaml
gateway:
  routes:
    - id: auth-service
      uri: lb://auth-service
      predicates:
        - Path=/api/auth/**
      filters:
        - StripPrefix=2
    - id: property-service
      uri: lb://property-service
      predicates:
        - Path=/api/properties/**
```

### 2. Service Registry
**Technology**: Netflix Eureka
**Responsibilities**:
- Service discovery và registration
- Health monitoring
- Load balancing information

### 3. Core Business Services

#### Auth Service
**Database**: MySQL + Redis
**Responsibilities**:
- User authentication (JWT, OAuth2)
- Authorization và role management
- Session management
- Password reset functionality

**Endpoints**:
```
POST /auth/login
POST /auth/register
POST /auth/refresh-token
POST /auth/logout
GET  /auth/me
```

#### Property Service
**Database**: MySQL + MongoDB (for media)
**Responsibilities**:
- Property CRUD operations
- Property search và filtering
- Image và media management
- Geo-location services
- Property categories và amenities

**Domain Model**:
```java
Property {
  id: Long
  title: String
  description: String
  address: Address
  price: BigDecimal
  amenities: List<Amenity>
  images: List<PropertyImage>
  availability: PropertyAvailability
  owner: User
}
```

#### Booking Service
**Database**: MySQL + Redis (caching)
**Responsibilities**:
- Booking lifecycle management
- Schedule management
- Conflict resolution
- Booking notifications

**State Machine**:
```
PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT
    ↓         ↓           ↓
 CANCELLED  CANCELLED  CANCELLED
```

#### Contract Service
**Database**: MySQL + File Storage
**Responsibilities**:
- Contract template management
- Digital signature integration
- Contract generation (PDF)
- Contract lifecycle tracking
- Legal compliance

#### Payment Service
**Database**: MySQL + External APIs
**Responsibilities**:
- Payment processing (VNPay, MoMo, Banking)
- Transaction management
- Refund handling
- Payment notifications
- Financial reporting

**Payment Flow**:
```
Booking Created → Payment Request → Gateway Processing 
     ↓                                    ↓
Payment Confirmed ← Webhook Notification ← Gateway Response
```

#### Billing Service
**Database**: MySQL
**Responsibilities**:
- Invoice generation
- Recurring billing
- Payment tracking
- Overdue management
- Financial reports

### 4. Support Services

#### Chat Service
**Database**: MongoDB + Redis
**Technology**: WebSocket + SockJS
**Responsibilities**:
- Real-time messaging
- Chat history
- File sharing in chat
- Online presence
- Message notifications

#### Notification Service
**Database**: MongoDB + Redis Queue
**Responsibilities**:
- Multi-channel notifications (Email, SMS, Push, In-app)
- Template management
- Delivery tracking
- Notification preferences
- Scheduled notifications

**Channels**:
```java
enum NotificationChannel {
    EMAIL, SMS, PUSH_NOTIFICATION, IN_APP, WEBHOOK
}
```

#### File Service
**Storage**: MinIO/AWS S3 + MySQL (metadata)
**Responsibilities**:
- File upload/download
- Image resizing và optimization
- File security và access control
- CDN integration
- File versioning

#### Search Service
**Database**: Elasticsearch
**Responsibilities**:
- Full-text search
- Geo-spatial search
- Filter và faceted search
- Search analytics
- Auto-suggestions

**Search Index**:
```json
{
  "properties": {
    "id": {"type": "keyword"},
    "title": {"type": "text", "analyzer": "vietnamese"},
    "location": {"type": "geo_point"},
    "price": {"type": "float"},
    "amenities": {"type": "keyword"},
    "availability": {"type": "boolean"}
  }
}
```

#### Analytics Service
**Database**: ClickHouse + MongoDB
**Responsibilities**:
- User behavior tracking
- Business metrics calculation
- Report generation
- Data visualization APIs
- Performance monitoring

### 5. Infrastructure Services

#### Profile Service
**Database**: MongoDB + Redis
**Responsibilities**:
- User profile management
- Preferences management
- Avatar và document storage
- Profile verification
- Privacy settings

#### Review Service
**Database**: MySQL + MongoDB
**Responsibilities**:
- Rating và review system
- Review moderation
- Sentiment analysis
- Review aggregation
- Fake review detection

#### Maintenance Service
**Database**: MySQL
**Responsibilities**:
- Maintenance request management
- Technician assignment
- Work order tracking
- Maintenance history
- Cost tracking

## 🗄️ Database Architecture

### MySQL (OLTP - Transactional Data)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Users     │  │ Properties  │  │  Bookings   │
│             │  │             │  │             │
├─────────────┤  ├─────────────┤  ├─────────────┤
│ id          │  │ id          │  │ id          │
│ email       │  │ title       │  │ property_id │
│ password    │  │ description │  │ user_id     │
│ role        │  │ price       │  │ start_date  │
│ created_at  │  │ owner_id    │  │ end_date    │
└─────────────┘  └─────────────┘  └─────────────┘
```

### MongoDB (Document Store)
```javascript
// Chat Messages
{
  _id: ObjectId,
  chatId: String,
  senderId: String,
  message: String,
  timestamp: Date,
  messageType: "TEXT|IMAGE|FILE",
  metadata: {}
}

// Property Media
{
  _id: ObjectId,
  propertyId: String,
  mediaType: "IMAGE|VIDEO|DOCUMENT",
  url: String,
  thumbnailUrl: String,
  metadata: {
    size: Number,
    dimensions: {width: Number, height: Number}
  }
}
```

### Redis (Caching & Sessions)
```
# Session Storage
session:{sessionId} → {userId, role, permissions, expiresAt}

# Property Cache
property:{propertyId} → {serialized property data}

# Search Cache
search:{query_hash} → {search results}

# Rate Limiting
ratelimit:{userId}:{endpoint} → {count, resetTime}
```

### Neo4j (Relationship & Recommendations)
```cypher
// User-Property Relationships
(:User)-[:OWNS]->(:Property)
(:User)-[:BOOKMARKED]->(:Property)
(:User)-[:VIEWED]->(:Property)
(:User)-[:BOOKED]->(:Property)

// Recommendation Queries
MATCH (u:User)-[:VIEWED]->(p:Property)<-[:VIEWED]-(other:User)
MATCH (other)-[:BOOKED]->(recommended:Property)
WHERE NOT (u)-[:VIEWED]->(recommended)
RETURN recommended
ORDER BY COUNT(other) DESC
LIMIT 10
```

## 🔄 Event-Driven Architecture

### Kafka Topics
```yaml
Topics:
  user-events:          # User registration, profile updates
  property-events:      # Property created, updated, deleted
  booking-events:       # Booking lifecycle events
  payment-events:       # Payment processing events
  notification-events:  # Notification triggers
  analytics-events:     # User behavior tracking
```

### Event Flow Example: Booking Process
```
1. User creates booking
   ↓
2. booking-service publishes 'BookingCreated'
   ↓
3. payment-service listens → creates payment request
   ↓
4. payment-service publishes 'PaymentRequested'
   ↓
5. notification-service listens → sends confirmation email
   ↓
6. analytics-service listens → tracks booking metrics
```

## 🔐 Security Architecture

### Authentication Flow
```
Client → API Gateway → Auth Service → JWT Token
  ↓
Protected Resource ← Token Validation ← JWT Token
```

### Authorization Matrix
```
Role        | Property | Booking | Payment | Admin
------------|----------|---------|---------|-------
GUEST       | Read     | Create  | Own     | None
TENANT      | Read     | CRUD    | Own     | None  
LANDLORD    | CRUD     | Read    | Own     | None
ADMIN       | CRUD     | CRUD    | CRUD    | CRUD
```

## 📊 Monitoring & Observability

### Metrics Collection
```
Application Metrics (Micrometer):
- Request rate, latency, error rate
- Database connection pool metrics
- JVM metrics (heap, GC, threads)

Business Metrics:
- Booking conversion rate
- Property view/booking ratio
- Payment success rate
- User engagement metrics
```

### Distributed Tracing
```
Request Flow:
API Gateway → Auth Service → Property Service → Database
     |            |              |                |
     └─────────────┴──────────────┴────────────────┘
                 Jaeger Trace ID: abc-123-def
```

## 🚀 Scalability Patterns

### Horizontal Scaling
- Each microservice can scale independently
- Database sharding cho high-traffic services
- CDN cho static content và images
- Read replicas cho read-heavy operations

### Caching Strategy
```
Level 1: Application Cache (Caffeine)
Level 2: Distributed Cache (Redis)
Level 3: CDN (CloudFlare/AWS CloudFront)
Level 4: Database Query Cache
```

### Load Balancing
```
Client → Load Balancer → API Gateway → Service Registry
                            ↓
                    Round-robin/Weighted routing
                            ↓
                   Service Instances (Auto-scaled)
```

## 🔄 Data Consistency

### Eventual Consistency
- Sử dụng Event Sourcing cho critical workflows
- Saga pattern cho distributed transactions
- Compensating transactions cho rollback

### CQRS Implementation
```
Write Side (Command):
BookingService → MySQL → Event Store

Read Side (Query):
Event Store → View Updater → MongoDB → Search Service
```

## 🛠️ Development Guidelines

### Service Design Principles
1. **Single Responsibility**: Mỗi service có một business domain
2. **Database per Service**: Không share database giữa services
3. **API First**: Design API contract trước khi implement
4. **Event-Driven**: Sử dụng events cho inter-service communication
5. **Resilience**: Circuit breaker, retry, timeout patterns

### Technology Stack
```yaml
Backend:
  - Java 17 + Spring Boot 3
  - Spring Cloud (Gateway, Eureka, Config)
  - Apache Kafka
  - Docker & Docker Compose

Databases:
  - MySQL 8.0
  - MongoDB 6.0
  - Redis 7.0
  - Neo4j 5.0
  - Elasticsearch 8.0

Monitoring:
  - Prometheus + Grafana
  - Jaeger (Tracing)
  - ELK Stack (Logging)
```

## 📋 Service Dependencies

### Startup Order
```
1. Infrastructure Services:
   - Kafka, Redis, Databases
   
2. Discovery & Configuration:
   - Eureka Server
   - Config Server
   
3. Gateway & Security:
   - API Gateway  
   - Auth Service
   
4. Core Business Services:
   - Profile Service
   - Property Service
   - File Service
   
5. Dependent Services:
   - Search Service (depends on Property)
   - Booking Service (depends on Property, Profile)
   - Payment Service (depends on Booking)
   - Contract Service (depends on Booking)
   - Billing Service (depends on Contract)
   
6. Support Services:
   - Chat Service
   - Notification Service
   - Review Service
   - Maintenance Service
   - Analytics Service
```

## 🔧 Configuration Management

### Spring Cloud Config
```yaml
# application.yml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/roomie/config-repo
          search-paths: '{application}'
          clone-on-start: true
```

### Environment-specific Configs
```
config-repo/
├── application.yml                 # Common config
├── application-dev.yml            # Development
├── application-staging.yml        # Staging  
├── application-prod.yml           # Production
├── auth-service/
│   ├── auth-service.yml
│   ├── auth-service-dev.yml
│   └── auth-service-prod.yml
└── property-service/
    ├── property-service.yml
    └── property-service-prod.yml
```

## 🚀 Deployment Strategies

### Blue-Green Deployment
```yaml
# docker-compose.blue.yml
version: '3.8'
services:
  property-service-blue:
    image: roomie/property-service:v1.2.0
    environment:
      - SPRING_PROFILES_ACTIVE=prod,blue
      - SERVER_PORT=8081

# docker-compose.green.yml  
  property-service-green:
    image: roomie/property-service:v1.3.0
    environment:
      - SPRING_PROFILES_ACTIVE=prod,green
      - SERVER_PORT=8082
```

### Canary Deployment
```yaml
# Load balancer config
upstream property-service {
    server property-service-v1:8080 weight=90;
    server property-service-v2:8080 weight=10;
}
```

## 🔄 Data Migration Strategy

### Database Versioning
```sql
-- V1.0__Initial_schema.sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- V1.1__Add_user_profile.sql  
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);

-- V1.2__Create_properties.sql
CREATE TABLE properties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    owner_id BIGINT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### Event Store Migration
```java
@EventHandler
public class PropertyEventMigrationHandler {
    
    @EventSourcingHandler
    public void on(PropertyCreatedEvent_V1 event) {
        // Migrate V1 events to V2 format
        PropertyCreatedEvent_V2 newEvent = new PropertyCreatedEvent_V2(
            event.getId(),
            event.getTitle(),
            event.getPrice(),
            // Add new fields with defaults
            PropertyType.APARTMENT,
            Collections.emptyList()
        );
        eventStore.saveEvent(newEvent);
    }
}
```

## 📈 Performance Optimization

### Database Optimization
```sql
-- Indexing Strategy
CREATE INDEX idx_properties_city_price ON properties(city, price);
CREATE INDEX idx_bookings_user_date ON bookings(user_id, check_in_date);
CREATE INDEX idx_messages_chat_timestamp ON messages(chat_id, created_at DESC);

-- Partitioning (Analytics data)
CREATE TABLE analytics_events (
    id BIGINT NOT NULL,
    event_type VARCHAR(50),
    user_id BIGINT,
    event_data JSON,
    created_at TIMESTAMP
) PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
    PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01')),
    PARTITION p202403 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01'))
);
```

### Caching Strategies
```java
@Service
public class PropertyService {
    
    @Cacheable(value = "properties", key = "#id")
    public Property findById(Long id) {
        return propertyRepository.findById(id);
    }
    
    @Cacheable(value = "property-search", key = "#criteria.hashCode()")
    public List<Property> search(SearchCriteria criteria) {
        return searchRepository.search(criteria);
    }
    
    @CacheEvict(value = {"properties", "property-search"}, allEntries = true)
    public Property updateProperty(Property property) {
        return propertyRepository.save(property);
    }
}
```

### Connection Pool Optimization
```yaml
# application.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 30000
      leak-detection-threshold: 60000
      
  data:
    mongodb:
      connection-pool:
        max-size: 100
        min-size: 10
        max-wait-time: 2000
        max-connection-idle-time: 60000
```

---

Kiến trúc này đảm bảo hệ thống Roomie có thể mở rộng để phục vụ hàng triệu người dùng với hiệu suất cao, độ tin cậy và khả năng bảo trì tốt.