# Ronaldo's Rentals

A full-stack vehicle rental management system with admin and customer portals.

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Node.js 16 or higher
- npm or yarn

### Backend Setup
1. Navigate to the `backend` directory:
   
   cd backend
   
2. Install dependencies and build:
   
   mvn clean install
   
3. Run the Spring Boot application:
   
   mvn spring-boot:run
   
   The backend will start on `http://localhost:8080`.

### Frontend Setup
1. Navigate to the `FrontEnd` directory:
   
   cd FrontEnd
   
2. Install dependencies:
   
   npm install
   
3. Start the React development server:
   
   npm start
   
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

