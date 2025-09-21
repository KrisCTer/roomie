#!/bin/bash

services=(
    "API Gateway:http://localhost:8888/actuator/health"
    "Auth Service:http://localhost:8080/actuator/health"
    "Property Service:http://localhost:8083/actuator/health"
    "Booking Service:http://localhost:8086/actuator/health"
    "Payment Service:http://localhost:8087/actuator/health"
    "Eureka:http://localhost:8761/actuator/health"
    "Grafana:http://localhost:3000/api/health"
    "MinIO:http://localhost:9000/minio/health/live"
)

echo "🏥 Health Check Report"
echo "====================="

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    url=$(echo $service | cut -d: -f2-)

    if curl -f -s $url > /dev/null; then
        echo "✅ $name - Healthy"
    else
        echo "❌ $name - Unhealthy"
    fi
done