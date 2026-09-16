

USE toeic_db;

-- Example data. Replace bcrypt hashes through the application register/create APIs
-- if you want known passwords for live testing.
INSERT INTO exams (title, description)
VALUES ('TOEIC Demo Test 01', 'Demo exam for SQL injection and MySQL security')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- If the exam title is unique in your database, this inserts sample answers for exam id 1.
INSERT INTO exam_answers (exam_id, question_number, correct_answer, explanation)
VALUES
    (1, 1, 'A', 'Demo answer 1'),
    (1, 2, 'C', 'Demo answer 2'),
    (1, 3, 'B', 'Demo answer 3');

INSERT INTO questions (exam_id, question_number, content, optiona, optionb, optionc, optiond)
VALUES
    (1, 1, 'Choose the correct answer for question 1.', 'A. correct demo option', 'B. option', 'C. option', 'D. option'),
    (1, 2, 'Choose the correct answer for question 2.', 'A. option', 'B. option', 'C. correct demo option', 'D. option'),
    (1, 3, 'Choose the correct answer for question 3.', 'A. option', 'B. correct demo option', 'C. option', 'D. option');

-- Before hardening: a broad application account.
CREATE USER IF NOT EXISTS 'toeic_app_unsafe'@'localhost' IDENTIFIED BY 'unsafe_demo_password';
GRANT ALL PRIVILEGES ON toeic_db.* TO 'toeic_app_unsafe'@'localhost';

-- After hardening: least-privilege application accounts.
CREATE USER IF NOT EXISTS 'toeic_app'@'localhost' IDENTIFIED BY 'safe_demo_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON toeic_db.users TO 'toeic_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON toeic_db.profiles TO 'toeic_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON toeic_db.exams TO 'toeic_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON toeic_db.questions TO 'toeic_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON toeic_db.exam_results TO 'toeic_app'@'localhost';

-- Keep answer access separate so normal app flows cannot read answers directly.
CREATE USER IF NOT EXISTS 'toeic_admin_app'@'localhost' IDENTIFIED BY 'admin_demo_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON toeic_db.exam_answers TO 'toeic_admin_app'@'localhost';
GRANT SELECT ON toeic_db.exams TO 'toeic_admin_app'@'localhost';

FLUSH PRIVILEGES;
