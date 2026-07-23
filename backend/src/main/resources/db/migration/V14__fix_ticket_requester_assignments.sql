-- V14__fix_ticket_requester_assignments.sql
-- Re-assign test tickets pointing to Super Admin (user_id = 1) to realistic Faculty and Student requesters

UPDATE tickets SET user_id = 5 WHERE id IN (1, 7); -- Reassign to Dr. Sarah Professor (Faculty)
UPDATE tickets SET user_id = 6 WHERE id IN (6, 8, 10); -- Reassign to Alex Student (Student)
