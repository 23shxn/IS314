# Dockerization and Deployment Tasks

## Backend Dockerization
- [x] Create Dockerfile for Spring Boot backend (multi-stage Maven build)
- [x] Update application.properties for production (CORS, env-based DB config)

## Frontend Dockerization
- [x] Create Dockerfile for React frontend (multi-stage build with Nginx)
- [x] Update frontend components to use configurable API base URL with fallback logic

## Docker Compose Setup
- [x] Create docker-compose.yml for local development (backend, frontend, postgres)
- [x] Create docker-compose.prod.yml for production deployment
- [x] Create .env files for development and production environments

## Testing and Deployment
- [ ] Test docker-compose locally
- [ ] Build and push Docker images for deployment
- [ ] Deploy to Ubuntu 25.04 on Digital Ocean
