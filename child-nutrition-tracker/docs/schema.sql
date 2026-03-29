-- =============================================================================
-- AI-Based Child Nutrition and Vaccination System
-- Database Schema (PostgreSQL Compatible)
-- =============================================================================
-- Version: 1.0
-- Created: 2026-01-18
-- Normalized to 3NF | Compatible with MySQL/PostgreSQL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores all system users (Parents, Health Centers, WHO Admins)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(100),
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'parent' 
                    CHECK (role IN ('parent', 'health_center', 'who')),
    region          VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login      TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_region ON users(region);

-- -----------------------------------------------------------------------------
-- 2. CHILDREN TABLE
-- Stores child profiles linked to parent users
-- -----------------------------------------------------------------------------
CREATE TABLE children (
    id                  SERIAL PRIMARY KEY,
    parent_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    dob                 DATE NOT NULL,
    gender              VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group         VARCHAR(5),
    allergies           TEXT,
    medical_conditions  TEXT,
    family_history      TEXT,
    region              VARCHAR(100),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_children_region ON children(region);

-- -----------------------------------------------------------------------------
-- 3. GROWTH RECORDS TABLE
-- Stores height, weight, and WHO Z-score assessments
-- -----------------------------------------------------------------------------
CREATE TABLE growth_records (
    id                      SERIAL PRIMARY KEY,
    child_id                INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    recorded_date           DATE NOT NULL,
    height_cm               DECIMAL(5,2) NOT NULL,
    weight_kg               DECIMAL(5,2) NOT NULL,
    head_circumference_cm   DECIMAL(5,2),
    waz_score               DECIMAL(4,2),  -- Weight-for-Age Z-score
    haz_score               DECIMAL(4,2),  -- Height-for-Age Z-score
    whz_score               DECIMAL(4,2),  -- Weight-for-Height Z-score
    baz_score               DECIMAL(4,2),  -- BMI-for-Age Z-score
    assessment_result       VARCHAR(50),
    growth_velocity         VARCHAR(50),
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_growth_child ON growth_records(child_id);
CREATE INDEX idx_growth_date ON growth_records(recorded_date);

-- -----------------------------------------------------------------------------
-- 4. BLOOD REPORTS TABLE
-- Stores lab test results for deficiency detection
-- -----------------------------------------------------------------------------
CREATE TABLE blood_reports (
    id              SERIAL PRIMARY KEY,
    child_id        INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    test_date       DATE NOT NULL,
    lab_name        VARCHAR(100),
    hemoglobin      DECIMAL(5,2),   -- g/dL
    serum_iron      DECIMAL(6,2),   -- µg/dL
    ferritin        DECIMAL(6,2),   -- ng/mL
    vitamin_d       DECIMAL(5,2),   -- ng/mL
    vitamin_b12     DECIMAL(6,2),   -- pg/mL
    calcium         DECIMAL(5,2),   -- mg/dL
    total_protein   DECIMAL(4,2),   -- g/dL
    albumin         DECIMAL(4,2),   -- g/dL
    folic_acid      DECIMAL(5,2),   -- ng/mL
    zinc            DECIMAL(5,2),   -- µg/dL
    analysis_result TEXT,
    recommendations TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blood_child ON blood_reports(child_id);
CREATE INDEX idx_blood_date ON blood_reports(test_date);

-- -----------------------------------------------------------------------------
-- 5. VACCINATION SCHEDULE TABLE (Master)
-- Indian UIP vaccination schedule reference data
-- -----------------------------------------------------------------------------
CREATE TABLE vax_schedule (
    id                  SERIAL PRIMARY KEY,
    vaccine_name        VARCHAR(50) NOT NULL,
    dose                VARCHAR(30),
    age_weeks           INTEGER,
    age_months          INTEGER,
    age_years           INTEGER,
    disease_prevented   TEXT,
    is_mandatory        BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_vax_vaccine ON vax_schedule(vaccine_name);

-- -----------------------------------------------------------------------------
-- 6. VACCINATIONS TABLE (Junction)
-- Tracks individual child vaccination records
-- Resolves M:N relationship between children and vax_schedule
-- -----------------------------------------------------------------------------
CREATE TABLE vaccinations (
    id              SERIAL PRIMARY KEY,
    child_id        INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    schedule_id     INTEGER NOT NULL REFERENCES vax_schedule(id) ON DELETE CASCADE,
    due_date        DATE,
    completed_date  DATE,
    batch_number    VARCHAR(50),
    administered_by VARCHAR(100),
    status          VARCHAR(20) DEFAULT 'pending' 
                    CHECK (status IN ('pending', 'completed', 'missed', 'delayed')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(child_id, schedule_id)
);

CREATE INDEX idx_vax_child ON vaccinations(child_id);
CREATE INDEX idx_vax_status ON vaccinations(status);
CREATE INDEX idx_vax_due ON vaccinations(due_date);

-- -----------------------------------------------------------------------------
-- 7. NUTRITION PLANS TABLE
-- Meal plans and dietary recommendations by category
-- -----------------------------------------------------------------------------
CREATE TABLE nutrition_plans (
    id                  SERIAL PRIMARY KEY,
    category            VARCHAR(50) NOT NULL,
    age_group           VARCHAR(30),
    deficiency_target   VARCHAR(100),
    meal_plan           TEXT,
    foods_list          TEXT,
    estimated_daily_cost INTEGER
);

CREATE INDEX idx_nutrition_category ON nutrition_plans(category);
CREATE INDEX idx_nutrition_deficiency ON nutrition_plans(deficiency_target);

-- -----------------------------------------------------------------------------
-- 8. ALERTS TABLE
-- System notifications and health warnings
-- -----------------------------------------------------------------------------
CREATE TABLE alerts (
    id           SERIAL PRIMARY KEY,
    child_id     INTEGER REFERENCES children(id) ON DELETE CASCADE,
    user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_type   VARCHAR(50) NOT NULL,
    severity     VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title        VARCHAR(200) NOT NULL,
    message      TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read      BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_child ON alerts(child_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- -----------------------------------------------------------------------------
-- 9. REFERENCE RANGES TABLE
-- Blood parameter normal ranges by age and gender
-- -----------------------------------------------------------------------------
CREATE TABLE reference_ranges (
    id            SERIAL PRIMARY KEY,
    parameter     VARCHAR(50) NOT NULL,
    age_group     VARCHAR(30) NOT NULL,
    gender        VARCHAR(10),
    low_critical  DECIMAL(8,2),
    low_normal    DECIMAL(8,2),
    high_normal   DECIMAL(8,2),
    high_critical DECIMAL(8,2),
    unit          VARCHAR(20)
);

CREATE INDEX idx_ref_parameter ON reference_ranges(parameter);
CREATE INDEX idx_ref_age ON reference_ranges(age_group);

-- -----------------------------------------------------------------------------
-- 10. TOKENS TABLE
-- Session management for authentication
-- -----------------------------------------------------------------------------
CREATE TABLE tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(64) UNIQUE NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP
);

CREATE INDEX idx_tokens_user ON tokens(user_id);
CREATE INDEX idx_tokens_expires ON tokens(expires_at);

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
