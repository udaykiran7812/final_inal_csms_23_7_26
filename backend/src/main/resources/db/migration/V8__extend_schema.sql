-- V8__extend_schema.sql

-- 1. Permissions Table
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Role Permissions Join Table
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 3. Modify Users Table
ALTER TABLE users ADD COLUMN department_id BIGINT NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id);

-- 4. Modify Staff Table
ALTER TABLE staff ADD COLUMN user_id BIGINT NULL;
ALTER TABLE staff ADD CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 5. Priorities Table
CREATE TABLE priorities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_color VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. SLA Rules Table
CREATE TABLE sla_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    priority_id BIGINT NOT NULL,
    user_role VARCHAR(50) NOT NULL, -- e.g., 'FACULTY', 'STUDENT'
    response_time_limit_minutes INT NOT NULL,
    resolution_time_limit_minutes INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (priority_id) REFERENCES priorities(id)
);

-- 7. Escalation Rules Table
CREATE TABLE escalation_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sla_rule_id BIGINT NOT NULL,
    trigger_after_minutes INT NOT NULL,
    escalation_level INT NOT NULL, -- 1, 2, 3
    notify_role VARCHAR(50) NOT NULL, -- e.g., 'DEPARTMENT_ADMIN', 'ADMIN', 'SUPER_ADMIN'
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sla_rule_id) REFERENCES sla_rules(id)
);

-- 8. Business Hours Table
CREATE TABLE business_hours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day_of_week INT NOT NULL, -- 1 = Monday, 7 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 9. Holidays Table
CREATE TABLE holidays (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 10. Assets Table
CREATE TABLE assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    asset_tag VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    department_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'ACTIVE', 'MAINTENANCE', 'RETIRED'
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 11. Modify Tickets Table
ALTER TABLE tickets ADD COLUMN asset_id BIGINT NULL;
ALTER TABLE tickets ADD COLUMN sla_response_deadline TIMESTAMP NULL;
ALTER TABLE tickets ADD COLUMN sla_resolution_deadline TIMESTAMP NULL;
ALTER TABLE tickets ADD COLUMN responded_at TIMESTAMP NULL;
ALTER TABLE tickets ADD COLUMN resolved_at TIMESTAMP NULL;
ALTER TABLE tickets ADD COLUMN sla_breached BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN priority_id BIGINT NULL;

ALTER TABLE tickets ADD CONSTRAINT fk_tickets_asset FOREIGN KEY (asset_id) REFERENCES assets(id);
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_priority FOREIGN KEY (priority_id) REFERENCES priorities(id);

-- Drop old priority column
ALTER TABLE tickets DROP COLUMN priority;

-- 12. Escalation History Table
CREATE TABLE escalation_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    escalation_level INT NOT NULL,
    notified_user_id BIGINT NOT NULL,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (notified_user_id) REFERENCES users(id)
);

-- 13. Comments Table
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 14. Attachments Table
CREATE TABLE attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    uploaded_by BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 15. Feedbacks Table
CREATE TABLE feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comments TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 16. Asset History Table
CREATE TABLE asset_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    ticket_id BIGINT NULL,
    action VARCHAR(255) NOT NULL,
    performed_by BIGINT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- 17. Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 18. Audit Logs Table
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
