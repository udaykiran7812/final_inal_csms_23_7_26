-- V10__add_subdepartments_and_hierarchy.sql

-- 1. Create SubDepartments Table
CREATE TABLE IF NOT EXISTS sub_departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    department_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sub_departments_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    CONSTRAINT uq_sub_dept_name_dept UNIQUE (name, department_id)
);

-- 2. Modify Roles Table to bind to Department and SubDepartment
ALTER TABLE roles ADD COLUMN department_id BIGINT NULL;
ALTER TABLE roles ADD COLUMN sub_department_id BIGINT NULL;

ALTER TABLE roles ADD CONSTRAINT fk_roles_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE roles ADD CONSTRAINT fk_roles_sub_department FOREIGN KEY (sub_department_id) REFERENCES sub_departments(id) ON DELETE SET NULL;

-- Remove global unique constraint on role name if present
ALTER TABLE roles DROP INDEX name;
ALTER TABLE roles ADD CONSTRAINT uq_role_name_dept UNIQUE (name, department_id);

-- 3. Modify Staff Table to bind to SubDepartment and Role
ALTER TABLE staff ADD COLUMN sub_department_id BIGINT NULL;
ALTER TABLE staff ADD COLUMN role_id BIGINT NULL;

ALTER TABLE staff ADD CONSTRAINT fk_staff_sub_department FOREIGN KEY (sub_department_id) REFERENCES sub_departments(id) ON DELETE SET NULL;
ALTER TABLE staff ADD CONSTRAINT fk_staff_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- 4. Modify Tickets Table to include SubDepartment
ALTER TABLE tickets ADD COLUMN sub_department_id BIGINT NULL;
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_sub_department FOREIGN KEY (sub_department_id) REFERENCES sub_departments(id) ON DELETE SET NULL;

-- 5. Modify SLA Rules Table to include Department and SubDepartment
ALTER TABLE sla_rules ADD COLUMN department_id BIGINT NULL;
ALTER TABLE sla_rules ADD COLUMN sub_department_id BIGINT NULL;

ALTER TABLE sla_rules ADD CONSTRAINT fk_sla_rules_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE;
ALTER TABLE sla_rules ADD CONSTRAINT fk_sla_rules_sub_department FOREIGN KEY (sub_department_id) REFERENCES sub_departments(id) ON DELETE CASCADE;

-- 6. Seed SubDepartments for 3 Major Departments
-- IT Support (department_id = 1)
INSERT INTO sub_departments (id, name, description, department_id, active) VALUES
(1, 'WiFi', 'Campus wireless network, authentication, and access point support', 1, true),
(2, 'Network', 'Core networking, switches, firewalls, and ethernet cabling', 1, true),
(3, 'Hardware', 'Laptops, desktops, peripherals, and workstation repairs', 1, true),
(4, 'AV', 'Audio/Visual systems, auditorium sound, and display equipment', 1, true),
(5, 'Smart Classroom Support', 'Podiums, digital boards, projectors, and hybrid lecture tools', 1, true);

-- Facilities (department_id = 2)
INSERT INTO sub_departments (id, name, description, department_id, active) VALUES
(6, 'Electrical', 'Power outlets, wiring, lighting, and circuit breaker repairs', 2, true),
(7, 'Plumbing', 'Water supply, drainage, restrooms, and pipe leakage maintenance', 2, true),
(8, 'Carpentry Repairs', 'Furniture, doors, locks, windows, and structural woodwork', 2, true);

-- Campus Operations (department_id = 3)
INSERT INTO sub_departments (id, name, description, department_id, active) VALUES
(9, 'Housekeeping', 'Sanitation, trash removal, deep cleaning, and waste management', 3, true),
(10, 'Security', 'Access badges, CCTV monitoring, parking, and campus safety', 3, true),
(11, 'Maintenance', 'General campus upkeep, HVAC, elevators, and outdoor grounds', 3, true);

-- Bind default seed roles to IT Support Network sub-department for testing
UPDATE roles SET department_id = 1, sub_department_id = 2 WHERE name = 'STAFF';
UPDATE staff SET sub_department_id = 2, role_id = 4 WHERE id = 1;
