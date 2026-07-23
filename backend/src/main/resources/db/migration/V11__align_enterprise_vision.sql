-- V11__align_enterprise_vision.sql

-- Ensure priorities exist
INSERT IGNORE INTO priorities (id, name, display_color) VALUES
(1, 'CRITICAL', 'red'),
(2, 'HIGH', 'orange'),
(3, 'MEDIUM', 'yellow'),
(4, 'LOW', 'green');

-- Update SLA timings to exact business spec:
-- CRITICAL: Response 10m, Resolution 120m (2h)
-- HIGH: Response 30m, Resolution 360m (6h)
-- MEDIUM: Response 120m (2h), Resolution 1440m (24h)
-- LOW: Response 480m (8h), Resolution 4320m (72h / 3 days)

-- Faculty SLA default rules
UPDATE sla_rules SET response_time_limit_minutes = 10, resolution_time_limit_minutes = 120 WHERE priority_id = 1 AND user_role = 'FACULTY';
UPDATE sla_rules SET response_time_limit_minutes = 30, resolution_time_limit_minutes = 360 WHERE priority_id = 2 AND user_role = 'FACULTY';
UPDATE sla_rules SET response_time_limit_minutes = 120, resolution_time_limit_minutes = 1440 WHERE priority_id = 3 AND user_role = 'FACULTY';
UPDATE sla_rules SET response_time_limit_minutes = 480, resolution_time_limit_minutes = 4320 WHERE priority_id = 4 AND user_role = 'FACULTY';

-- Student SLA default rules
UPDATE sla_rules SET response_time_limit_minutes = 10, resolution_time_limit_minutes = 120 WHERE priority_id = 1 AND user_role = 'STUDENT';
UPDATE sla_rules SET response_time_limit_minutes = 30, resolution_time_limit_minutes = 360 WHERE priority_id = 2 AND user_role = 'STUDENT';
UPDATE sla_rules SET response_time_limit_minutes = 120, resolution_time_limit_minutes = 1440 WHERE priority_id = 3 AND user_role = 'STUDENT';
UPDATE sla_rules SET response_time_limit_minutes = 480, resolution_time_limit_minutes = 4320 WHERE priority_id = 4 AND user_role = 'STUDENT';

-- Global Fallback SLA rules (for ALL user roles)
INSERT IGNORE INTO sla_rules (id, priority_id, user_role, response_time_limit_minutes, resolution_time_limit_minutes, active) VALUES
(100, 1, 'ALL', 10, 120, true),
(101, 2, 'ALL', 30, 360, true),
(102, 3, 'ALL', 120, 1440, true),
(103, 4, 'ALL', 480, 4320, true);

-- Add multi-tier escalation thresholds:
-- Level 1: 30 minutes SLA breach -> notify DEPARTMENT_ADMIN
-- Level 2: 120 minutes (2 hrs) SLA breach -> notify ADMIN
-- Level 3: 240 minutes (4 hrs) SLA breach -> notify SUPER_ADMIN
INSERT IGNORE INTO escalation_rules (id, sla_rule_id, trigger_after_minutes, escalation_level, notify_role) VALUES
(1001, 100, 30, 1, 'DEPARTMENT_ADMIN'),
(1002, 100, 120, 2, 'ADMIN'),
(1003, 100, 240, 3, 'SUPER_ADMIN'),
(1004, 101, 30, 1, 'DEPARTMENT_ADMIN'),
(1005, 101, 120, 2, 'ADMIN'),
(1006, 101, 240, 3, 'SUPER_ADMIN'),
(1007, 102, 30, 1, 'DEPARTMENT_ADMIN'),
(1008, 102, 120, 2, 'ADMIN'),
(1009, 102, 240, 3, 'SUPER_ADMIN'),
(1010, 103, 30, 1, 'DEPARTMENT_ADMIN'),
(1011, 103, 120, 2, 'ADMIN'),
(1012, 103, 240, 3, 'SUPER_ADMIN');
