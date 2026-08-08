-- =========================================================
-- MediCore
-- Smart Hospital Management System
-- PostgreSQL Database Schema
-- =========================================================

-- =========================
-- USERS
-- =========================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(30) NOT NULL
        CHECK (
            role IN (
                'ADMIN',
                'DOCTOR',
                'PATIENT',
                'RECEPTIONIST',
                'LAB_STAFF'
            )
        ),

    phone VARCHAR(20),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- DEPARTMENTS
-- =========================

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- DOCTORS
-- =========================

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    department_id INTEGER NOT NULL,

    specialization VARCHAR(150) NOT NULL,

    license_number VARCHAR(100) NOT NULL UNIQUE,

    qualification VARCHAR(200),

    experience_years INTEGER DEFAULT 0
        CHECK (experience_years >= 0),

    consultation_fee DECIMAL(10,2) DEFAULT 0
        CHECK (consultation_fee >= 0),

    bio TEXT,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE RESTRICT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- PATIENTS
-- =========================

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    patient_number VARCHAR(50) NOT NULL UNIQUE,

    date_of_birth DATE,

    gender VARCHAR(20),

    blood_group VARCHAR(10),

    emergency_contact_name VARCHAR(100),

    emergency_contact_phone VARCHAR(20),

    address TEXT,

    allergies TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================
-- DOCTOR AVAILABILITY
-- =========================

CREATE TABLE doctor_availability (
    id SERIAL PRIMARY KEY,

    doctor_id INTEGER NOT NULL,

    day_of_week INTEGER NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    is_available BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE,

    CHECK (start_time < end_time),

    UNIQUE (
        doctor_id,
        day_of_week,
        start_time,
        end_time
    )
);


-- =========================
-- APPOINTMENTS
-- =========================

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,

    patient_id INTEGER NOT NULL,

    doctor_id INTEGER NOT NULL,

    appointment_date DATE NOT NULL,

    appointment_time TIME NOT NULL,

    status VARCHAR(30) DEFAULT 'PENDING'
        CHECK (
            status IN (
                'PENDING',
                'CONFIRMED',
                'CHECKED_IN',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED',
                'NO_SHOW'
            )
        ),

    reason TEXT,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE,

    UNIQUE (
        doctor_id,
        appointment_date,
        appointment_time
    )
);


-- =========================
-- MEDICAL RECORDS
-- =========================

CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,

    patient_id INTEGER NOT NULL,

    doctor_id INTEGER NOT NULL,

    appointment_id INTEGER,

    diagnosis TEXT NOT NULL,

    symptoms TEXT,

    treatment TEXT,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE,

    FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE SET NULL
);


-- =========================
-- MEDICINES
-- =========================

CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    generic_name VARCHAR(150),

    manufacturer VARCHAR(150),

    description TEXT,

    stock_quantity INTEGER DEFAULT 0
        CHECK (stock_quantity >= 0),

    price DECIMAL(10,2) DEFAULT 0
        CHECK (price >= 0),

    expiry_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- PRESCRIPTIONS
-- =========================

CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,

    patient_id INTEGER NOT NULL,

    doctor_id INTEGER NOT NULL,

    appointment_id INTEGER,

    diagnosis TEXT,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE,

    FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE SET NULL
);


-- =========================
-- PRESCRIPTION ITEMS
-- =========================

CREATE TABLE prescription_items (
    id SERIAL PRIMARY KEY,

    prescription_id INTEGER NOT NULL,

    medicine_id INTEGER NOT NULL,

    dosage VARCHAR(100) NOT NULL,

    frequency VARCHAR(100) NOT NULL,

    duration VARCHAR(100) NOT NULL,

    instructions TEXT,

    FOREIGN KEY (prescription_id)
        REFERENCES prescriptions(id)
        ON DELETE CASCADE,

    FOREIGN KEY (medicine_id)
        REFERENCES medicines(id)
        ON DELETE RESTRICT
);


-- =========================
-- LAB TESTS
-- =========================

CREATE TABLE lab_tests (
    id SERIAL PRIMARY KEY,

    patient_id INTEGER NOT NULL,

    doctor_id INTEGER NOT NULL,

    appointment_id INTEGER,

    test_name VARCHAR(150) NOT NULL,

    description TEXT,

    status VARCHAR(30) DEFAULT 'REQUESTED'
        CHECK (
            status IN (
                'REQUESTED',
                'SAMPLE_COLLECTED',
                'PROCESSING',
                'COMPLETED',
                'CANCELLED'
            )
        ),

    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    completed_at TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE,

    FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE SET NULL
);


-- =========================
-- LAB REPORTS
-- =========================

CREATE TABLE lab_reports (
    id SERIAL PRIMARY KEY,

    test_id INTEGER NOT NULL UNIQUE,

    result TEXT,

    normal_range VARCHAR(150),

    remarks TEXT,

    report_file VARCHAR(255),

    verified_by INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (test_id)
        REFERENCES lab_tests(id)
        ON DELETE CASCADE,

    FOREIGN KEY (verified_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================
-- INVOICES
-- =========================

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,

    invoice_number VARCHAR(50) NOT NULL UNIQUE,

    patient_id INTEGER NOT NULL,

    appointment_id INTEGER,

    subtotal DECIMAL(10,2) DEFAULT 0
        CHECK (subtotal >= 0),

    discount DECIMAL(10,2) DEFAULT 0
        CHECK (discount >= 0),

    tax DECIMAL(10,2) DEFAULT 0
        CHECK (tax >= 0),

    total DECIMAL(10,2) DEFAULT 0
        CHECK (total >= 0),

    payment_status VARCHAR(30) DEFAULT 'PENDING'
        CHECK (
            payment_status IN (
                'PENDING',
                'PAID',
                'PARTIALLY_PAID',
                'CANCELLED'
            )
        ),

    payment_method VARCHAR(30),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE SET NULL
);


-- =========================
-- INVOICE ITEMS
-- =========================

CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,

    invoice_id INTEGER NOT NULL,

    item_name VARCHAR(200) NOT NULL,

    description TEXT,

    quantity INTEGER DEFAULT 1
        CHECK (quantity > 0),

    unit_price DECIMAL(10,2) NOT NULL
        CHECK (unit_price >= 0),

    total_price DECIMAL(10,2) NOT NULL
        CHECK (total_price >= 0),

    FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE CASCADE
);


-- =========================
-- NOTIFICATIONS
-- =========================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    type VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- =========================
-- AUDIT LOGS
-- =========================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,

    user_id INTEGER,

    action VARCHAR(150) NOT NULL,

    entity VARCHAR(100),

    entity_id INTEGER,

    ip_address VARCHAR(50),

    details TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);


-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_doctors_department
ON doctors(department_id);

CREATE INDEX idx_patients_number
ON patients(patient_number);

CREATE INDEX idx_appointments_patient
ON appointments(patient_id);

CREATE INDEX idx_appointments_doctor
ON appointments(doctor_id);

CREATE INDEX idx_appointments_date
ON appointments(appointment_date);

CREATE INDEX idx_medical_records_patient
ON medical_records(patient_id);

CREATE INDEX idx_prescriptions_patient
ON prescriptions(patient_id);

CREATE INDEX idx_lab_tests_patient
ON lab_tests(patient_id);

CREATE INDEX idx_invoices_patient
ON invoices(patient_id);

CREATE INDEX idx_notifications_user
ON notifications(user_id);

CREATE INDEX idx_audit_logs_user
ON audit_logs(user_id);

CREATE INDEX idx_audit_logs_created
ON audit_logs(created_at);


-- =========================================================
-- MediCore Database Schema Complete
-- =========================================================