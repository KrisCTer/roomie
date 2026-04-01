#!/bin/bash

if [ $# -eq 1 ]; then
    service_name=$1
    echo "🔄 Restarting $service_name..."

    # Find and restart the service
    if [ -f "docker-compose.$service_name.yml" ]; then
        docker-compose -f docker-compose.$service_name.yml restart
    elif [ -f "services/$service_name/docker-compose.$service_name.yml" ]; then
        docker-compose -f services/$service_name/docker-compose.$service_name.yml restart
    else
        docker-compose restart $service_name
    fi

    echo "✅ $service_name restarted"
else
    echo "Usage: ./infra/scripts/operations/restart-service.sh <service-name>"
fi