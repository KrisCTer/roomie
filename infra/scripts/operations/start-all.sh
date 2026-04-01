#!/bin/bash

echo "🚀 Starting Roomie Microservices..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if service is healthy
check_health() {
    local service_name=$1
    local health_url=$2
    local max_attempts=30
    local attempt=0

    echo "⏳ Waiting for $service_name to be healthy..."

    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s $health_url > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is healthy${NC}"
            return 0
        fi

        attempt=$((attempt + 1))
        echo "🔄 Attempt $attempt/$max_attempts for $service_name..."
        sleep 10
    done

    echo -e "${RED}❌ $service_name failed to start${NC}"
    return 1
}

# Create network if it doesn't exist
echo "🌐 Creating network..."
docker network create roomie-network 2>/dev/null || true

# Step 1: Start infrastructure services
echo -e "${YELLOW}📦 Starting infrastructure services...${NC}"
docker-compose up -d

# Wait for key infrastructure services
check_health "MySQL" "http://localhost:3306" || exit 1
check_health "MongoDB" "http://localhost:27017" || exit 1
check_health "Redis" "http://localhost:6379" || exit 1
check_health "Kafka" "http://localhost:9092" || exit 1
check_health "Eureka" "http://localhost:8761/actuator/health" || exit 1

# Step 2: Start core services
echo -e "${YELLOW}🏢 Starting core services...${NC}"
docker-compose -f docker-compose.auth-service.yml up -d
check_health "Auth Service" "http://localhost:8080/actuator/health" || exit 1

docker-compose -f docker-compose.file-service.yml up -d
check_health "File Service" "http://localhost:8084/actuator/health" || exit 1

docker-compose -f docker-compose.profile-service.yml up -d
check_health "Profile Service" "http://localhost:8081/actuator/health" || exit 1

# Step 3: Start business services
echo -e "${YELLOW}💼 Starting business services...${NC}"
docker-compose -f docker-compose.property-service.yml up -d
check_health "Property Service" "http://localhost:8083/actuator/health" || exit 1

docker-compose -f docker-compose.booking-service.yml up -d
check_health "Booking Service" "http://localhost:8086/actuator/health" || exit 1

docker-compose -f docker-compose.payment-service.yml up -d
check_health "Payment Service" "http://localhost:8087/actuator/health" || exit 1

# Step 4: Start supporting services
echo -e "${YELLOW}🔧 Starting supporting services...${NC}"
docker-compose -f docker-compose.chat-service.yml up -d
docker-compose -f docker-compose.notification-service.yml up -d
docker-compose -f docker-compose.search-service.yml up -d

# Step 5: Start management services
echo -e "${YELLOW}⚙️ Starting management services...${NC}"
docker-compose -f docker-compose.admin-service.yml up -d
docker-compose -f docker-compose.analytics-service.yml up -d
docker-compose -f docker-compose.billing-service.yml up -d

# Step 6: Start API Gateway last
echo -e "${YELLOW}🌐 Starting API Gateway...${NC}"
docker-compose -f docker-compose.api-gateway.yml up -d
check_health "API Gateway" "http://localhost:8888/actuator/health" || exit 1

# Optional: Start monitoring
read -p "🔍 Do you want to start monitoring services? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📊 Starting monitoring services...${NC}"
    docker-compose -f docker-compose.monitoring.yml up -d
fi

echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo ""
echo "📋 Service URLs:"
echo "🌐 API Gateway: http://localhost:8888"
echo "🔐 Auth Service: http://localhost:8080"
echo "🏠 Property Service: http://localhost:8083"
echo "🔍 Eureka Dashboard: http://localhost:8761"
echo "📊 Grafana: http://localhost:3000 (admin/roomie123)"
echo "🔎 Jaeger: http://localhost:16686"
echo "📁 MinIO Console: http://localhost:9001 (roomie/roomie123)"
echo ""
echo -e "${GREEN}✨ Roomie is ready to use!${NC}"