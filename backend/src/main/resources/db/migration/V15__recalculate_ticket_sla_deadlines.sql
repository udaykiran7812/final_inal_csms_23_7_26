-- V15__recalculate_ticket_sla_deadlines.sql
-- Recalculate ticket SLA deadlines to match Super Admin priority configuration timings exactly

-- Medium Priority: 120m (2 hours) response, 1440m (24 hours / 1 day) resolution
UPDATE tickets 
SET sla_response_deadline = DATE_ADD(created_at, INTERVAL 120 MINUTE),
    sla_resolution_deadline = DATE_ADD(created_at, INTERVAL 1440 MINUTE)
WHERE priority_id = 3;

-- High Priority: 30m response, 360m (6 hours) resolution
UPDATE tickets 
SET sla_response_deadline = DATE_ADD(created_at, INTERVAL 30 MINUTE),
    sla_resolution_deadline = DATE_ADD(created_at, INTERVAL 360 MINUTE)
WHERE priority_id = 2;

-- Critical Priority: 15m response, 180m (3 hours) resolution
UPDATE tickets 
SET sla_response_deadline = DATE_ADD(created_at, INTERVAL 15 MINUTE),
    sla_resolution_deadline = DATE_ADD(created_at, INTERVAL 180 MINUTE)
WHERE priority_id = 1;

-- Low Priority: 480m (8 hours) response, 4320m (72 hours / 3 days) resolution
UPDATE tickets 
SET sla_response_deadline = DATE_ADD(created_at, INTERVAL 480 MINUTE),
    sla_resolution_deadline = DATE_ADD(created_at, INTERVAL 4320 MINUTE)
WHERE priority_id = 4;
