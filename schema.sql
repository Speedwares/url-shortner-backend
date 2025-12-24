-- Create database (run this separately if database doesn't exist)
-- CREATE DATABASE urlshortener;

-- Connect to the database before running the following:

-- Create urls table
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on short_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
