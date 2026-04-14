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
  failed_login_attempts INT NOT NULL DEFAULT 0,
  lock_until DATETIME DEFAULT NULL,
  otp_code VARCHAR(6) DEFAULT NULL,
  otp_expiry TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL, -- NULL means it's a default category for all users
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- Insert default categories
INSERT IGNORE INTO categories (user_id, name) VALUES 
(NULL, 'Food'),
(NULL, 'Travel'),
(NULL, 'Bills'),
(NULL, 'Entertainment'),
(NULL, 'Health'),
(NULL, 'Education');

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_user_date (user_id, expense_date)
);

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  source VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency ENUM('monthly', 'weekly', 'one-time') DEFAULT 'one-time',
  income_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, income_date)
);

-- Create budgets table (monthly budgets per category)
CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  month_key VARCHAR(7) NOT NULL, -- format: YYYY-MM
  budget_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  UNIQUE(user_id, category_id, month_key),
  INDEX idx_budget_lookup (user_id, month_key)
);
