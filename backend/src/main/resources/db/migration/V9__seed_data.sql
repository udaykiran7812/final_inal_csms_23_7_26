-- V9__seed_data.sql

-- Clear existing tables to prevent duplicate primary keys on pre-seeded local databases
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;
TRUNCATE TABLE users;
TRUNCATE TABLE departments;
TRUNCATE TABLE staff;
TRUNCATE TABLE issue_categories;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'SUPER_ADMIN', 'Highest authority with full access to configuration, SLA management, and auditing'),
(2, 'ADMIN', 'Campus administrator managing users, staff, and viewing tickets'),
(3, 'DEPARTMENT_ADMIN', 'Department manager overseeing tickets, assigning staff, and handling escalations'),
(4, 'STAFF', 'Staff engineer or handler resolving assigned support tickets'),
(5, 'FACULTY', 'University faculty member raising high-priority requests'),
(6, 'STUDENT', 'University student raising standard-priority requests');

-- 2. Insert Permissions
INSERT INTO permissions (id, name, description) VALUES
(1, 'MANAGE_USERS', 'Create, update, delete users'),
(2, 'MANAGE_ADMINS', 'Manage administrators'),
(3, 'MANAGE_ROLES', 'Create roles and modify permissions'),
(4, 'MANAGE_DEPARTMENTS', 'Manage university departments'),
(5, 'MANAGE_SLA_RULES', 'Manage priority levels and SLA limits'),
(6, 'MANAGE_ESCALATIONS', 'Configure escalation rules'),
(7, 'MANAGE_WORKING_HOURS', 'Configure working hours and holidays'),
(8, 'VIEW_ALL_TICKETS', 'View all tickets in the system'),
(9, 'VIEW_DEPT_TICKETS', 'View tickets in assigned department'),
(10, 'VIEW_ASSIGNED_TICKETS', 'View tickets assigned directly to self'),
(11, 'CREATE_TICKETS', 'Create/raise new tickets'),
(12, 'ASSIGN_TICKETS', 'Assign tickets to staff members'),
(13, 'MANAGE_ASSETS', 'View and manage system assets'),
(14, 'VIEW_AUDIT_LOGS', 'View system-wide security audit logs'),
(15, 'VIEW_REPORTS', 'View analytics and performance reports');

-- 3. Insert Role Permissions mappings
-- SUPER_ADMIN gets all (1 to 15)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15);

-- ADMIN gets 1, 4, 8, 12, 13, 15
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 4), (2, 8), (2, 12), (2, 13), (2, 15);

-- DEPARTMENT_ADMIN gets 9, 12, 13, 15
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 9), (3, 12), (3, 13), (3, 15);

-- STAFF gets 10
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 10);

-- FACULTY gets 11
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 11);

-- STUDENT gets 11
INSERT INTO role_permissions (role_id, permission_id) VALUES
(6, 11);

-- 4. Insert Departments
INSERT INTO departments (id, name, description) VALUES
(1, 'IT Support', 'WiFi, Network, Hardware, AV, Smart Classroom support'),
(2, 'Facilities', 'Electrical, Plumbing, Carpentry repairs'),
(3, 'Campus Operations', 'Housekeeping, Security, Maintenance');

-- 5. Insert Priorities
INSERT INTO priorities (id, name, display_color) VALUES
(1, 'CRITICAL', 'red'),
(2, 'HIGH', 'orange'),
(3, 'MEDIUM', 'yellow'),
(4, 'LOW', 'green');

-- 6. Insert SLA Rules (limit values in minutes)
-- CRITICAL SLA rules
INSERT INTO sla_rules (id, priority_id, user_role, response_time_limit_minutes, resolution_time_limit_minutes) VALUES
(1, 1, 'FACULTY', 10, 120),  -- 10 mins response, 2 hours resolution
(2, 1, 'STUDENT', 15, 180);  -- 15 mins response, 3 hours resolution

-- HIGH SLA rules
INSERT INTO sla_rules (id, priority_id, user_role, response_time_limit_minutes, resolution_time_limit_minutes) VALUES
(3, 2, 'FACULTY', 20, 240),  -- 20 mins response, 4 hours resolution
(4, 2, 'STUDENT', 30, 360);  -- 30 mins response, 6 hours resolution

-- MEDIUM SLA rules
INSERT INTO sla_rules (id, priority_id, user_role, response_time_limit_minutes, resolution_time_limit_minutes) VALUES
(5, 3, 'FACULTY', 60, 720),  -- 1 hour response, 12 hours resolution
(6, 3, 'STUDENT', 120, 1440); -- 2 hours response, 24 hours resolution

-- LOW SLA rules
INSERT INTO sla_rules (id, priority_id, user_role, response_time_limit_minutes, resolution_time_limit_minutes) VALUES
(7, 4, 'FACULTY', 240, 2880), -- 4 hours response, 48 hours resolution
(8, 4, 'STUDENT', 480, 4320); -- 8 hours response, 72 hours resolution

-- 7. Insert Escalation Rules
-- Level 1 triggers 15 minutes after SLA breach -> notify Dept Admin
-- Level 2 triggers 30 minutes after SLA breach -> notify Admin
-- Level 3 triggers 60 minutes after SLA breach -> notify Super Admin
INSERT INTO escalation_rules (id, sla_rule_id, trigger_after_minutes, escalation_level, notify_role) VALUES
(1, 1, 15, 1, 'DEPARTMENT_ADMIN'), (2, 1, 30, 2, 'ADMIN'), (3, 1, 60, 3, 'SUPER_ADMIN'),
(4, 2, 15, 1, 'DEPARTMENT_ADMIN'), (5, 2, 30, 2, 'ADMIN'), (6, 2, 60, 3, 'SUPER_ADMIN'),
(7, 3, 15, 1, 'DEPARTMENT_ADMIN'), (8, 3, 30, 2, 'ADMIN'), (9, 3, 60, 3, 'SUPER_ADMIN'),
(10, 4, 15, 1, 'DEPARTMENT_ADMIN'), (11, 4, 30, 2, 'ADMIN'), (12, 4, 60, 3, 'SUPER_ADMIN'),
(13, 5, 30, 1, 'DEPARTMENT_ADMIN'), (14, 5, 60, 2, 'ADMIN'), (15, 5, 120, 3, 'SUPER_ADMIN'),
(16, 6, 30, 1, 'DEPARTMENT_ADMIN'), (17, 6, 60, 2, 'ADMIN'), (18, 6, 120, 3, 'SUPER_ADMIN'),
(19, 7, 60, 1, 'DEPARTMENT_ADMIN'), (20, 7, 120, 2, 'ADMIN'), (21, 7, 240, 3, 'SUPER_ADMIN'),
(22, 8, 60, 1, 'DEPARTMENT_ADMIN'), (23, 8, 120, 2, 'ADMIN'), (24, 8, 240, 3, 'SUPER_ADMIN');

-- 8. Insert Default Working Hours (Monday to Friday, 9:00 AM to 5:00 PM)
INSERT INTO business_hours (day_of_week, start_time, end_time) VALUES
(1, '09:00:00', '17:00:00'),
(2, '09:00:00', '17:00:00'),
(3, '09:00:00', '17:00:00'),
(4, '09:00:00', '17:00:00'),
(5, '09:00:00', '17:00:00');

-- 9. Insert Seed Users (Password is 'admin123' for all)
-- Password BCrypt: $2a$10$Ze5o.mA/nH7x.pYyk0YULOeCJgC0L/09tFyzkPqaWTFAiBFrw9FzS
INSERT INTO users (id, first_name, last_name, email, password, phone, role_id, department_id) VALUES
(1, 'Super', 'Admin', 'superadmin@csms.com', '$2a$10$Ze5o.mA/nH7x.pYyk0YULOeCJgC0L/09tFyzkPqaWTFAiBFrw9FzS', '0000000000', 1, NULL),
(2, 'Campus', 'Admin', 'admin@csms.com', '$2a$10$Ze5o.mA/nH7x.pYyk0YULOeCJgC0L/09tFyzkPqaWTFAiBFrw9FzS', '1111111111', 2, NULL),
(3, 'IT Dept', 'Admin', 'deptadmin@csms.com', '$2a$10$Ze5o.mA/nH7x.pYyk0YULOeCJgC0L/09tFyzkPqaWTFAiBFrw9FzS', '2222222222', 3, 1),
(4, 'John', 'Engineer', 'staff@csms.com', '$2a$10$Ze5o.mA/nH7x.pYyk0YULOeCJgC0L/09tFyzkPqaWTFAiBFrw9FzS', '3333333333', 4, 1),
(5, 'Dr. Sarah', 'Professor', 'faculty@csms.com', '$2a$10$Ze5o.mA/nH7x.pYyk0YULOeCJgC0L/09tFyzkPqaWTFAiBFrw9FzS', '4444444444', 5, NULL),
(6, 'Alex', 'Student', 'student@csms.com', '$2a$10$Ze5o.mA/nH7x.pYyk0YULOeCJgC0L/09tFyzkPqaWTFAiBFrw9FzS', '5555555555', 6, NULL);

-- 10. Link john engineer into staff table
INSERT INTO staff (id, name, email, phone, department_id, user_id) VALUES
(1, 'John Engineer', 'staff@csms.com', '3333333333', 1, 4);

-- 11. Seed Issue Categories
INSERT INTO issue_categories (id, name, description, active) VALUES
(1, 'Network & Wifi Issues', 'Internet connectivity, router problems, WiFi authentication errors', true),
(2, 'Hardware Repair', 'Physical damage, parts replacement, diagnostics for devices', true),
(3, 'Software Installation', 'OS configuration, lab software packages, license renewals', true),
(4, 'Smart Classroom / AV', 'Projector malfunctions, classroom audio setup, lecture capture systems', true),
(5, 'Facilities Maintenance', 'Electrical repairs, plumbing issues, temperature control', true);

-- 12. Seed Assets
INSERT INTO assets (id, name, asset_tag, type, status, location, department_id, active) VALUES
(1, 'Main Campus Router (Core)', 'AST-NET-001', 'NETWORK', 'ACTIVE', 'IT Server Room, Floor 2', 1, true),
(2, 'Classroom 301 Projector', 'AST-AV-301', 'SMART_CLASSROOM', 'ACTIVE', 'Block A, Classroom 301', 1, true),
(3, 'Computer Lab Laptop #04', 'AST-HW-104', 'HARDWARE', 'ACTIVE', 'Library Computer Lab', 1, true),
(4, 'Departmental Printer', 'AST-HW-202', 'HARDWARE', 'MAINTENANCE', 'Administrative Office, Block B', 1, true);
