# Ronaldo's Rentals

A comprehensive full-stack vehicle rental management system built with Spring Boot (backend) and React (frontend). The system provides separate portals for customers and administrators, featuring vehicle management, reservation handling, user management, and maintenance tracking.

## 🚀 Features

### Customer Portal
- **Vehicle Search & Booking**: Browse available vehicles with advanced filtering
- **Online Reservations**: Complete booking system with real-time availability
- **User Registration & Authentication**: Secure login and account management
- **Reservation Management**: View, modify, and cancel bookings
- **Payment Integration**: Secure checkout process
- **Email Notifications**: Automated booking confirmations and updates

### Admin Portal
- **Multi-level Access Control**: Super Admin and Regular Admin roles
- **Vehicle Management**: Add, edit, delete, and manage vehicle inventory
- **User Management**: Approve registrations and manage customer accounts
- **Reservation Oversight**: Monitor and manage all bookings
- **Maintenance Tracking**: Schedule and track vehicle maintenance
- **Pending Request System**: Approval workflow for vehicle changes
- **Dashboard Analytics**: Overview of system statistics and performance

### Technical Features
- **Image Upload & Management**: Base64-encoded vehicle images with carousel display
- **Email Service Integration**: SMTP-based notifications
- **Database Persistence**: PostgreSQL with JPA/Hibernate
- **Security**: Spring Security with session management
- **Responsive Design**: Mobile-friendly UI with modern styling
- **RESTful API**: Comprehensive backend API endpoints

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 17
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security
- **Email**: Spring Mail (SMTP)
- **Build Tool**: Maven
- **Container**: Docker support

### Frontend
- **Framework**: React 19.1.1
- **Routing**: React Router DOM 6.14.2
- **HTTP Client**: Axios 1.12.2
- **Icons**: Lucide React 0.536.0
- **Styling**: Custom CSS with responsive design
- **Build Tool**: Create React App

### Infrastructure
- **Database**: PostgreSQL (configurable via environment variables)
- **Session Management**: HTTP sessions with secure cookies
- **File Upload**: Multipart support for vehicle images
- **CORS**: Configured for frontend-backend communication

## 📋 Prerequisites

- **Java**: JDK 17 or higher
- **Maven**: 3.6+ for backend builds
- **Node.js**: 16+ for frontend development
- **PostgreSQL**: Database server (local or Docker)
- **Git**: For version control

## 🚀 Quick Start

### 1. Clone the Repository
bash
git clone <repository-url>
cd ronaldo-rentals


### 2. Database Setup
Ensure PostgreSQL is running and create a database:
sql
CREATE DATABASE postgres;

Default connection settings (configurable in `application.properties`):
- Host: localhost:5433
- Username: postgres
- Password: 123456789

### 3. Backend Setup
bash
cd backend
mvn clean install
mvn spring-boot:run

The backend will start on `http://localhost:8080`.

### 4. Frontend Setup
bash
cd ../FrontEnd
npm install
npm start

The frontend will start on `http://localhost:3000`.

## 🔧 Configuration

### Environment Variables

#### Backend (application.properties)
properties
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=123456789

# Email Configuration
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password

# Server Configuration
SERVER_PORT=8080


#### Frontend (.env.development)
env
REACT_APP_API_URL=http://localhost:8080


### Docker Deployment
bash
# Build and run with Docker Compose
docker-compose up --build


## 👥 Default Admin Accounts

The system automatically creates these accounts on startup:

### Super Admin (Manager)
- **Username**: manager
- **Email**: manager@ronaldosrentals.com
- **Password**: Manager123!
- **Permissions**: Full system access, can create new admins

### Regular Admins
- **Username**: admin1 / admin2
- **Email**: admin1@ronaldosrentals.com / admin2@ronaldosrentals.com
- **Password**: Admin123!
- **Permissions**: Standard admin operations

## 📁 Project Structure


ronaldo-rentals/
├── backend/                          # Spring Boot backend
│   ├── src/main/java/com/grp12/
│   │   ├── BackendApplication.java   # Main application class
│   │   ├── config/                   # Configuration classes
│   │   ├── Controller/               # REST controllers
│   │   ├── Model/                    # JPA entities
│   │   ├── Repository/               # Data access layer
│   │   ├── Services/                 # Business logic
│   │   └── Exception/                # Custom exceptions
│   ├── src/main/resources/
│   │   ├── application.properties    # App configuration
│   │   └── data.sql                  # Initial data
│   ├── Dockerfile                    # Docker configuration
│   └── pom.xml                       # Maven dependencies
├── FrontEnd/                         # React frontend
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── styles/                   # CSS stylesheets
│   │   ├── App.js                    # Main app component
│   │   └── index.js                  # App entry point
│   ├── package.json                  # NPM dependencies
│   └── Dockerfile                    # Frontend Docker config
├── DB Images/                        # Database-related assets
└── README.md                         # This file


## 🔐 Security Features

- **Authentication**: Session-based authentication with secure cookies
- **Authorization**: Role-based access control (Super Admin, Admin, Customer)
- **Password Security**: Encrypted password storage
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Comprehensive form validation
- **Session Management**: Configurable session timeouts

## 🔄 Version History

- **v1.0.0**: Initial release with core rental management features
- Complete vehicle and user management system
- Admin dashboard with role-based access
- Customer portal with booking functionality
- Email notifications and maintenance tracking

---

**Note**: Remember to change default passwords and configure email settings for production deployment!

