-- ============================================================
-- Resurgence Portal – Seed Data
-- ============================================================
-- USE resurgence;

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
INSERT INTO subjects (subject_code, subject_name, dept_id, semester, credits) VALUES
    ('CSE301', 'Data Structures & Algorithms',         1, 3, 4),
    ('CSE302', 'Operating Systems',                    1, 4, 4),
    ('CSE303', 'Database Management Systems',          1, 5, 3),
    ('CSE304', 'Computer Networks',                    1, 5, 3),
    ('CSE305', 'Theory of Computation',                1, 5, 3),
    ('CSE306', 'Compiler Design',                      1, 6, 3),
    ('CSE307', 'Machine Learning',                     1, 6, 4),
    ('CSE308', 'Web Technologies',                     1, 6, 3)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);

-- ISE
INSERT INTO subjects (subject_code, subject_name, dept_id, semester, credits) VALUES
    ('ISE301', 'Software Engineering',                 2, 3, 3),
    ('ISE302', 'Information & Network Security',        2, 4, 4),
    ('ISE303', 'Object Oriented Programming with Java', 2, 4, 4),
    ('ISE304', 'Data Warehousing & Mining',            2, 5, 3),
    ('ISE305', 'Cloud Computing',                      2, 6, 3),
    ('ISE306', 'Artificial Intelligence',              2, 6, 4),
    ('ISE307', 'Mobile Application Development',       2, 7, 3)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);

-- ECE
INSERT INTO subjects (subject_code, subject_name, dept_id, semester, credits) VALUES
    ('ECE301', 'Analog Circuits',                      3, 3, 4),
    ('ECE302', 'Digital Signal Processing',            3, 4, 4),
    ('ECE303', 'VLSI Design',                          3, 5, 3),
    ('ECE304', 'Microcontrollers & Embedded Systems',  3, 4, 4),
    ('ECE305', 'Wireless Communication',               3, 6, 3),
    ('ECE306', 'Antenna & Wave Propagation',           3, 6, 3),
    ('ECE307', 'Control Systems',                      3, 5, 4)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);

-- MECH
INSERT INTO subjects (subject_code, subject_name, dept_id, semester, credits) VALUES
    ('MECH301', 'Strength of Materials',               4, 3, 4),
    ('MECH302', 'Fluid Mechanics',                     4, 4, 4),
    ('MECH303', 'Thermodynamics',                      4, 3, 4),
    ('MECH304', 'Manufacturing Processes',             4, 4, 3),
    ('MECH305', 'Machine Design',                      4, 5, 3),
    ('MECH306', 'Heat & Mass Transfer',                4, 6, 3),
    ('MECH307', 'Industrial Engineering',              4, 5, 3)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);

-- CIVIL
INSERT INTO subjects (subject_code, subject_name, dept_id, semester, credits) VALUES
    ('CIVIL301', 'Structural Analysis',                5, 4, 4),
    ('CIVIL302', 'Geotechnical Engineering',           5, 5, 3),
    ('CIVIL303', 'Transportation Engineering',         5, 6, 3),
    ('CIVIL304', 'Environmental Engineering',          5, 5, 3),
    ('CIVIL305', 'Concrete Technology',                5, 4, 3),
    ('CIVIL306', 'Surveying & Geomatics',              5, 3, 3),
    ('CIVIL307', 'Construction Management',            5, 7, 3)
ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name);
