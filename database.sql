-- Database Schema for FinanceFlow

CREATE DATABASE IF NOT EXISTS financeflow;
USE financeflow;

-- Table for College Fees
CREATE TABLE IF NOT EXISTS college_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    term_name VARCHAR(255) NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    amount_saved DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('Upcoming', 'Funded', 'Paid') DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    type ENUM('Income', 'Expense') NOT NULL,
    bucket ENUM('Spending', 'College', 'Savings') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for Savings Goals (Optional enhancement based on readme)
CREATE TABLE IF NOT EXISTS savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
