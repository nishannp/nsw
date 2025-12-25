-- Database Schema for FinanceFlow
-- Final Version: Ready for Production

CREATE DATABASE IF NOT EXISTS financeflow;
USE financeflow;

-- Table for College Fees
-- Tracks installments for college. Status updates automatically when funded.
CREATE TABLE IF NOT EXISTS college_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    term_name VARCHAR(255) NOT NULL,
    amount_due DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    amount_saved DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('Upcoming', 'Funded', 'Paid') DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Savings Goals
-- "Virtual Envelopes" for saving money.
CREATE TABLE IF NOT EXISTS savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Transactions
-- The core ledger. Linked to fees/goals for tracking contributions.
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    type ENUM('Income', 'Expense') NOT NULL,
    -- Bucket now allows 'Income' for salary/transfers in logic
    bucket ENUM('Spending', 'College', 'Savings', 'Income') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    
    -- New Columns for Smart Features
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    linked_fee_id INT NULL,
    linked_goal_id INT NULL,
    running_balance DECIMAL(10, 2) NULL,
    
    FOREIGN KEY (linked_fee_id) REFERENCES college_fees(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_goal_id) REFERENCES savings_goals(id) ON DELETE SET NULL
);
