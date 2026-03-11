-- ============================================================
-- Resurgence Portal – Seed Data
-- ============================================================
USE resurgence;

-- ------------------------------------------------------------
-- Departments
-- ------------------------------------------------------------
INSERT INTO departments (dept_name) VALUES
    ('Computer Science & Engineering'),
    ('Information Science & Engineering'),
    ('Electronics & Communication Engineering'),
    ('Mechanical Engineering'),
    ('Civil Engineering')
ON DUPLICATE KEY UPDATE dept_name = VALUES(dept_name);

-- ------------------------------------------------------------
-- Subjects  (dept_id 1 = CSE, 2 = ISE, 3 = ECE, 4 = MECH, 5 = CIVIL)
-- ------------------------------------------------------------

-- CSE
INSERT INTO subjects (subject_code, subject_name, dept_id, credits) VALUES
    ('CSE301', 'Data Structures & Algorithms',         1, 4),
    ('CSE302', 'Operating Systems',                    1, 4),
    ('CSE303', 'Database Management Systems',          1, 3),
    ('CSE304', 'Computer Networks',                    1, 3),
    ('CSE305', 'Theory of Computation',                1, 3),
    ('CSE306', 'Compiler Design',                      1, 3),
    ('CSE307', 'Machine Learning',                     1, 4),
    ('CSE308', 'Web Technologies',                     1, 3)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);

-- ISE
INSERT INTO subjects (subject_code, subject_name, dept_id, credits) VALUES
    ('ISE301', 'Software Engineering',                 2, 3),
    ('ISE302', 'Information & Network Security',        2, 4),
    ('ISE303', 'Object Oriented Programming with Java', 2, 4),
    ('ISE304', 'Data Warehousing & Mining',            2, 3),
    ('ISE305', 'Cloud Computing',                      2, 3),
    ('ISE306', 'Artificial Intelligence',              2, 4),
    ('ISE307', 'Mobile Application Development',       2, 3)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);

-- ECE
INSERT INTO subjects (subject_code, subject_name, dept_id, credits) VALUES
    ('ECE301', 'Analog Circuits',                      3, 4),
    ('ECE302', 'Digital Signal Processing',            3, 4),
    ('ECE303', 'VLSI Design',                          3, 3),
    ('ECE304', 'Microcontrollers & Embedded Systems',  3, 4),
    ('ECE305', 'Wireless Communication',               3, 3),
    ('ECE306', 'Antenna & Wave Propagation',           3, 3),
    ('ECE307', 'Control Systems',                      3, 4)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);

-- MECH
INSERT INTO subjects (subject_code, subject_name, dept_id, credits) VALUES
    ('MECH301', 'Strength of Materials',               4, 4),
    ('MECH302', 'Fluid Mechanics',                     4, 4),
    ('MECH303', 'Thermodynamics',                      4, 4),
    ('MECH304', 'Manufacturing Processes',             4, 3),
    ('MECH305', 'Machine Design',                      4, 3),
    ('MECH306', 'Heat & Mass Transfer',                4, 3),
    ('MECH307', 'Industrial Engineering',              4, 3)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);

-- CIVIL
INSERT INTO subjects (subject_code, subject_name, dept_id, credits) VALUES
    ('CIVIL301', 'Structural Analysis',                5, 4),
    ('CIVIL302', 'Geotechnical Engineering',           5, 3),
    ('CIVIL303', 'Transportation Engineering',         5, 3),
    ('CIVIL304', 'Environmental Engineering',          5, 3),
    ('CIVIL305', 'Concrete Technology',                5, 3),
    ('CIVIL306', 'Surveying & Geomatics',              5, 3),
    ('CIVIL307', 'Construction Management',            5, 3)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);
