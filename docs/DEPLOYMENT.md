# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- 8GB+ RAM
- 50GB+ Storage

## Quick Start
1. `git clone <repo>`
2. `cp .env.example .env`
3. `./scripts/start-all.sh`

## Production Deployment
- Use docker-compose.prod.yml
- Configure SSL certificates
- Set up backup strategies
- Monitor with Grafana dashboards