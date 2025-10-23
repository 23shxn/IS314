-- Create registration_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS registration_requests (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    drivers_license_number VARCHAR(50) NOT NULL,
    drivers_license_image TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    approved_at TIMESTAMP
);

-- Create indexes for registration_requests
CREATE INDEX IF NOT EXISTS idx_reg_email ON registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_reg_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_reg_license ON registration_requests(drivers_license_number);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(10),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    drivers_license_number VARCHAR(50) NOT NULL UNIQUE,
    drivers_license_image TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_license ON users(drivers_license_number);

-- Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create indexes for admins table
CREATE INDEX IF NOT EXISTS idx_admin_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admin_username ON admins(username);

-- Create vehicles table if it doesn't exist
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(30),
    license_plate VARCHAR(20) UNIQUE,
    vin VARCHAR(30) UNIQUE,
    fuel_type VARCHAR(20),
    transmission VARCHAR(20),
    seating_capacity INTEGER,
    mileage INTEGER,
    price_per_day DECIMAL(8,2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    image_url VARCHAR(500),
    vehicle_image_1 TEXT,
    vehicle_image_2 TEXT,
    vehicle_image_3 TEXT,
    description TEXT,
    features TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create indexes for vehicles table
CREATE INDEX IF NOT EXISTS idx_vehicle_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicle_location ON vehicles(location);
CREATE INDEX IF NOT EXISTS idx_vehicle_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_type ON vehicles(vehicle_type);

-- Create reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    title VARCHAR(10),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    rental_date DATE NOT NULL,
    return_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Confirmed',
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create reservation_amenities table for ElementCollection
CREATE TABLE IF NOT EXISTS reservation_amenities (
    reservation_id BIGINT NOT NULL,
    amenity VARCHAR(255),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- Create maintenance_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    car_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    date TIMESTAMP NOT NULL,
    next_date TIMESTAMP,
    mechanic VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    mileage INTEGER,
    receipt TEXT,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create pending_maintenance_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS pending_maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    car_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    date TIMESTAMP NOT NULL,
    next_date TIMESTAMP,
    mechanic VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    mileage INTEGER,
    receipt TEXT,
    requested_by BIGINT NOT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT,
    approved_at TIMESTAMP,
    rejection_reason TEXT
);

-- Create pending_vehicle_changes table if it doesn't exist
CREATE TABLE IF NOT EXISTS pending_vehicle_changes (
    id BIGSERIAL PRIMARY KEY,
    change_type VARCHAR(20) NOT NULL,
    vehicle_data TEXT,
    vehicle_id BIGINT,
    requested_by BIGINT NOT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT,
    approved_at TIMESTAMP,
    rejection_reason TEXT
);
