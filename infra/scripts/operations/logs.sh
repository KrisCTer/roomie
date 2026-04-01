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
    echo "Usage: ./infra/scripts/operations/logs.sh <service-name>"
    echo "Example: ./infra/scripts/operations/logs.sh auth-service"
fi