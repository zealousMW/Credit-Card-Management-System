-- Credit Card Management System Database Schema


-- Users table
CREATE TABLE IF NOT EXISTS users (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
card_number_encrypted VARCHAR(255) NOT NULL,
credit_limit DECIMAL(10, 2) NOT NULL,
balance DECIMAL(10, 2) DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE
);

-- Monthly Bills table
CREATE TABLE IF NOT EXISTS monthly_bills (
id INT AUTO_INCREMENT PRIMARY KEY,
card_id INT NOT NULL,
category_id INT,
bill_date DATE NOT NULL,
billed_amount DECIMAL(10, 2) NOT NULL,
minimum_payment_due DECIMAL(10, 2) NOT NULL,
monthly_cleared_amount DECIMAL(10, 2) DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Default categories seed
INSERT INTO categories (name) VALUES
('Groceries'),
('Utilities'),
('Entertainment'),
('Travel'),
('Dining'),
('Healthcare'),
('Education'),
('Shopping'),
('Fuel'),
('Miscellaneous');