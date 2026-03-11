-- ============================================================
-- Resurgence Portal – Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS resurgence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE resurgence;

-- ------------------------------------------------------------
-- 1. departments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id        INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2. students
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id         INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    usn        VARCHAR(20)  NOT NULL UNIQUE,
    name       VARCHAR(150) NOT NULL,
    semester   TINYINT      UNSIGNED NOT NULL CHECK (semester BETWEEN 1 AND 8),
    dept_id    INT          UNSIGNED NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. subjects
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    subject_code VARCHAR(20)  NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    dept_id      INT          UNSIGNED NOT NULL,
    credits      TINYINT      UNSIGNED NOT NULL DEFAULT 3,
    PRIMARY KEY (subject_code),
    FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. registrations
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
    reg_id       INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id   INT          UNSIGNED NOT NULL,
    subject_code VARCHAR(20)  NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reg_id),
    UNIQUE KEY uq_student_subject (student_id, subject_code),
    FOREIGN KEY (student_id)   REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
