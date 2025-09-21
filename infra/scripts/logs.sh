#!/bin/bash

# Show logs for specific service
if [ $# -eq 1 ]; then
    service_name=$1
    echo "📋 Showing logs for $service_name..."
    docker-compose logs -f $service_name
else
    echo "📋 Available services:"
    echo "  - infrastructure: mysql, mongodb, redis, kafka, etc."
    echo "  - services: auth-service, property-service, etc."
    echo ""
    echo "Usage: ./scripts/logs.sh <service-name>"
    echo "Example: ./scripts/logs.sh auth-service"
fi