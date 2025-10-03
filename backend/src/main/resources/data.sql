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
    updated_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reg_email ON registration_requests(email);
CREATE INDEX IF NOT EXISTS idx_reg_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_reg_license ON registration_requests(drivers_license_number);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    drivers_license_number VARCHAR(50) NOT NULL UNIQUE,
    drivers_license_image TEXT,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_license ON users(drivers_license_number);

-- If using MySQL/PostgreSQL
ALTER TABLE users MODIFY COLUMN created_at TIMESTAMP NULL;
-- OR set a default value
ALTER TABLE users MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;