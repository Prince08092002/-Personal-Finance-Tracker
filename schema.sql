-- Run this script in your MySQL client to set up the database.

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS finance_app;

-- Use the database
USE finance_app;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  is_deleted BOOLEAN DEFAULT 0,
  otp_code VARCHAR(6) DEFAULT NULL,
  otp_expiry TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
