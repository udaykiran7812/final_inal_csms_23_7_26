-- V13__fix_staff_multi_dept_and_users.sql

-- 1. Create staff_departments join table for staff working across multiple departments
CREATE TABLE IF NOT EXISTS staff_departments (
    staff_id      BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    PRIMARY KEY (staff_id, department_id),
    CONSTRAINT fk_staff_depts_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_depts_dept  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 2. Create staff_sub_departments join table
CREATE TABLE IF NOT EXISTS staff_sub_departments (
    staff_id          BIGINT NOT NULL,
    sub_department_id BIGINT NOT NULL,
    PRIMARY KEY (staff_id, sub_department_id),
    CONSTRAINT fk_staff_subdepts_staff   FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_subdepts_subdept FOREIGN KEY (sub_department_id) REFERENCES sub_departments(id) ON DELETE CASCADE
);

-- 3. Clean up any malformed admin names from previous department updates
UPDATE users SET first_name = 'IT Dept', last_name = 'Admin' WHERE email = 'deptadmin@csms.com' OR email = 'ithead@csms.com';
UPDATE users SET first_name = 'Facilities Dept', last_name = 'Admin' WHERE email = 'facilitieshead@csms.com';
UPDATE users SET first_name = 'Operations Dept', last_name = 'Admin' WHERE email = 'opshead@csms.com';

-- Delete duplicate generated head users if present
DELETE FROM users WHERE email IN ('ithead@csms.com', 'facilitieshead@csms.com', 'opshead@csms.com');

-- 4. Populate staff_departments and staff_sub_departments from existing staff records
INSERT IGNORE INTO staff_departments (staff_id, department_id)
SELECT id, department_id FROM staff WHERE department_id IS NOT NULL;

INSERT IGNORE INTO staff_sub_departments (staff_id, sub_department_id)
SELECT id, sub_department_id FROM staff WHERE sub_department_id IS NOT NULL;

-- 5. Ensure every staff record has a corresponding user account
INSERT IGNORE INTO users (first_name, last_name, email, password, phone, role_id, department_id, active)
SELECT 
    SUBSTRING_INDEX(s.name, ' ', 1) AS first_name,
    IF(LOCATE(' ', s.name) > 0, SUBSTRING(s.name, LOCATE(' ', s.name) + 1), '') AS last_name,
    s.email,
    '$2a$10$Ze5o.mA/nH7x.pYyk0YULOeCJgC0L/09tFyzkPqaWTFAiBFrw9FzS', -- admin123 / staff123
    s.phone,
    4, -- STAFF role_id
    s.department_id,
    true
FROM staff s
WHERE s.user_id IS NULL AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = s.email);

-- Link staff records to newly created user accounts
UPDATE staff s
JOIN users u ON s.email = u.email
SET s.user_id = u.id
WHERE s.user_id IS NULL;
