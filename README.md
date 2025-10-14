# Ronaldo's Rentals - Vehicle Rental Management System

A full-stack vehicle rental management system with separate portals for customers, regular admins, and super admins.

## System Overview

This application provides a comprehensive vehicle rental platform with three distinct user roles:
- **Customer**: Can browse vehicles, make reservations, and manage their bookings
- **Admin**: Can manage vehicles, handle reservations, and process maintenance requests
- **Super Admin**: Has all admin capabilities plus additional management features like approving vehicle changes and managing admin accounts

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Node.js 16 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies and build:
   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### Frontend Setup
1. Navigate to the `FrontEnd` directory:
   ```bash
   cd FrontEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will start on `http://localhost:3000`.

## Default Admin Accounts

The following admin accounts are pre-created when the application starts:

### Super Admin (Manager)
- **Username:** manager
- **Email:** manager@ronaldosrentals.com
- **Password:** Manager123!
- **Role:** Can add new admin accounts

### Admin 1
- **Username:** admin1
- **Email:** admin1@ronaldosrentals.com
- **Password:** Admin123!
- **Role:** Regular admin access

### Admin 2
- **Username:** admin2
- **Email:** admin2@ronaldosrentals.com
- **Password:** Admin123!
- **Role:** Regular admin access

## Adding New Admins

Only the Super Admin (manager) can add new admin accounts through the secret key combination in the admin login page.

**Security Note:** Change these default passwords in production!

## Docker Deployment

The application can be deployed using Docker with the provided docker-compose.yml file:
```bash
docker-compose down
docker-compose up --build
```

## Current Implementation Status

Based on the TODO files in the repository, here's the current status of implementation:

### Backend Features
- [x] Pending vehicle change model for vehicle add/remove approvals
- [x] Pending maintenance record model for maintenance approvals
- [x] Pending vehicle change repository
- [x] Pending maintenance record repository
- [x] Pending vehicle controller with pending endpoints
- [x] Pending maintenance controller with pending endpoints
- [x] Vehicle controller modified with role-based logic
- [x] Maintenance controller modified to use pending requests for admins (not superadmins)
- [x] User delete endpoint in user controller (SUPER_ADMIN only)

### Frontend Features
- [x] Vehicle management modified with role-based views
- [x] Vehicle maintenance updated for role-based views
- [x] User deletion added to user management for superadmin
- [x] Admin creation form implemented in super admin dashboard
- [x] Super admin dashboard navigation and views updated

### Testing Status
- [x] Backend tests passed (Spring Boot context loads successfully)
- [x] Frontend tests passed (App renders correctly)
- [ ] Vehicle approval workflow testing
- [ ] Maintenance approval workflow testing
- [ ] User deletion testing
- [ ] Admin creation with email testing