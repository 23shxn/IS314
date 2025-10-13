# Rental Reservation System

A full-stack vehicle rental reservation system built with Spring Boot (Java) backend and React frontend.

## Features

- User authentication and authorization
- Vehicle search and booking
- Admin dashboard for vehicle and user management
- Maintenance tracking
- Email notifications
- Payment processing simulation
- Responsive design

## Tech Stack

- **Backend**: Spring Boot, Java 17, PostgreSQL, JPA/Hibernate
- **Frontend**: React, React Router, Axios
- **Deployment**: Docker, Docker Compose, Nginx

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Java 17+ (for local backend development)

### Quick Start with Docker

1. Clone the repository
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your PostgreSQL password
4. Run the application:
   ```bash
   docker-compose up --build
   ```
5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Development Setup (without Docker)

1. **Backend Setup**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Frontend Setup**:
   ```bash
   cd FrontEnd
   npm install
   npm start
   ```

## Production Deployment

### Using Docker Compose

1. Update `.env` with production values
2. Build and run production containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

### Manual Deployment on Ubuntu

1. Install Docker and Docker Compose on your Ubuntu server
2. Clone the repository
3. Copy and configure `.env` file
4. Run the production compose file:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
POSTGRES_PASSWORD=your_secure_password

# API Configuration
REACT_APP_API_URL=https://rms.shaneel.tech

# Backend Configuration
SPRING_PROFILES_ACTIVE=prod
CORS_ALLOWED_ORIGINS=https://rms.shaneel.tech
```

## API Documentation

The backend provides RESTful APIs for:
- User management (`/api/auth/*`)
- Vehicle operations (`/api/vehicles/*`)
- Reservations (`/api/reservations/*`)
- Admin functions (`/api/admin/*`)

## Database Schema

The system uses PostgreSQL with the following main entities:
- Users
- Vehicles
- Reservations
- Maintenance Records
- Admins

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
