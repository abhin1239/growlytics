-- MySQL Schema for Child Nutrition Tracker

SET FOREIGN_KEY_CHECKS = 0;

-- Users table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'parent',
    region VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
) ENGINE=InnoDB;

-- Children table
DROP TABLE IF EXISTS children;
CREATE TABLE children (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(50) NOT NULL,
    blood_group VARCHAR(10),
    allergies TEXT,
    medical_conditions TEXT,
    family_history TEXT,
    region VARCHAR(255),
    is_active INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Growth Records table
DROP TABLE IF EXISTS growth_records;
CREATE TABLE growth_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    recorded_date DATE NOT NULL,
    height_cm DECIMAL(10,2) NOT NULL,
    weight_kg DECIMAL(10,2) NOT NULL,
    head_circumference_cm DECIMAL(10,2),
    waz_score DECIMAL(10,2),
    haz_score DECIMAL(10,2),
    whz_score DECIMAL(10,2),
    baz_score DECIMAL(10,2),
    assessment_result VARCHAR(255),
    growth_velocity VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Blood Reports table
DROP TABLE IF EXISTS blood_reports;
CREATE TABLE blood_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    test_date DATE NOT NULL,
    lab_name VARCHAR(255),
    hemoglobin DECIMAL(10,2),
    serum_iron DECIMAL(10,2),
    ferritin DECIMAL(10,2),
    vitamin_d DECIMAL(10,2),
    vitamin_b12 DECIMAL(10,2),
    calcium DECIMAL(10,2),
    total_protein DECIMAL(10,2),
    albumin DECIMAL(10,2),
    folic_acid DECIMAL(10,2),
    zinc DECIMAL(10,2),
    analysis_result TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Vaccination Schedule (Master)
DROP TABLE IF EXISTS vax_schedule;
CREATE TABLE vax_schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vaccine_name VARCHAR(255) NOT NULL,
    dose VARCHAR(255),
    age_weeks INT,
    age_months INT,
    age_years INT,
    disease_prevented TEXT,
    is_mandatory TINYINT DEFAULT 1
) ENGINE=InnoDB;

-- Vaccinations (Child tracking)
DROP TABLE IF EXISTS vaccinations;
CREATE TABLE vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    schedule_id INT NOT NULL,
    alert_start_date DATE,
    deadline_date DATE,
    completed_date DATE,
    batch_number VARCHAR(255),
    administered_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    last_alert_sent_date DATE DEFAULT NULL,
    escalation_sent TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES vax_schedule(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Nutrition Plans
DROP TABLE IF EXISTS nutrition_plans;
CREATE TABLE nutrition_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    age_group VARCHAR(255),
    deficiency_target VARCHAR(255),
    meal_plan TEXT,
    foods_list TEXT,
    estimated_daily_cost INT
) ENGINE=InnoDB;

-- Alerts
DROP TABLE IF EXISTS alerts;
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT,
    user_id INT,
    target_role VARCHAR(50),
    target_region VARCHAR(255),
    alert_type VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    vax_name VARCHAR(255),
    due_date DATE,
    vax_status VARCHAR(50),
    child_age VARCHAR(50),
    parent_name VARCHAR(255),
    district VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT DEFAULT 0,
    is_dismissed TINYINT DEFAULT 0,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Reference Ranges for blood parameters
DROP TABLE IF EXISTS reference_ranges;
CREATE TABLE reference_ranges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parameter VARCHAR(255) NOT NULL,
    age_group VARCHAR(255) NOT NULL,
    gender VARCHAR(50),
    low_critical DECIMAL(10,2),
    low_normal DECIMAL(10,2),
    high_normal DECIMAL(10,2),
    high_critical DECIMAL(10,2),
    unit VARCHAR(50)
) ENGINE=InnoDB;

-- Tokens for session management
DROP TABLE IF EXISTS tokens;
CREATE TABLE tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
