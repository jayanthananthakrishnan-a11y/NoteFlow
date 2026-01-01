-- Migration: Create Users Table
-- Description: Stores user account information for Creators and Viewers

-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('Creator', 'Viewer');

-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'Viewer',
    profile_picture VARCHAR(500),
    bio TEXT,
    date_created TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_date_created ON users(date_created);

-- Add comment to table
COMMENT ON TABLE users IS 'Stores user account information for both Creators and Viewers';
COMMENT ON COLUMN users.password IS 'Bcrypt hashed password';
