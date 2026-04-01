#!/bin/bash

echo "🛑 Stopping Roomie Microservices..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop in reverse order
echo -e "${YELLOW}⏹️ Stopping API Gateway...${NC}"
docker-compose -f docker-compose.api-gateway.yml down

echo -e "${YELLOW}⏹️ Stopping management services...${NC}"
docker-compose -f docker-compose.admin-service.yml down
docker-compose -f docker-compose.analytics-service.yml down
docker-compose -f docker-compose.billing-service.yml down

echo -e "${YELLOW}⏹️ Stopping supporting services...${NC}"
docker-compose -f docker-compose.chat-service.yml down
docker-compose -f docker-compose.notification-service.yml down
docker-compose -f docker-compose.search-service.yml down

echo -e "${YELLOW}⏹️ Stopping business services...${NC}"
docker-compose -f docker-compose.property-service.yml down
docker-compose -f docker-compose.booking-service.yml down
docker-compose -f docker-compose.payment-service.yml down

echo -e "${YELLOW}⏹️ Stopping core services...${NC}"
docker-compose -f docker-compose.auth-service.yml down
docker-compose -f docker-compose.file-service.yml down
docker-compose -f docker-compose.profile-service.yml down

echo -e "${YELLOW}⏹️ Stopping infrastructure services...${NC}"
docker-compose down

echo -e "${YELLOW}⏹️ Stopping monitoring services...${NC}"
docker-compose -f docker-compose.monitoring.yml down

# Optional: Remove volumes
read -p "🗑️ Do you want to remove all data volumes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}🗑️ Removing volumes...${NC}"
    docker-compose down -v
    docker volume prune -f
fi

# Optional: Remove network
read -p "🌐 Do you want to remove the network? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}🌐 Removing network...${NC}"
    docker network rm roomie-network 2>/dev/null || true
fi

echo -e "${GREEN}✅ All services stopped successfully!${NC}"