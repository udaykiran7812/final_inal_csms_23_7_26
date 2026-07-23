-- V16__seed_department_issue_categories.sql
-- Seed issue categories for Facilities Management and Campus Operations

INSERT INTO issue_categories (id, name, description, active) VALUES
(6, 'Electrical & Power Supply', 'Wiring, power sockets, light fixtures, AC failures', true),
(7, 'Plumbing & Water Leakage', 'Restroom plumbing, pipe leaks, water dispenser repairs', true),
(8, 'Furniture & Civil Maintenance', 'Broken desks, door locks, whiteboard replacement', true),
(9, 'Housekeeping & Sanitation', 'Classroom cleaning, waste management, sanitation', true),
(10, 'Security & Access Control', 'ID card access, key issuance, gate pass queries', true),
(11, 'Event & Hall Setup', 'Auditorium arrangements, seating, public address systems', true)
ON DUPLICATE KEY UPDATE active = true;
