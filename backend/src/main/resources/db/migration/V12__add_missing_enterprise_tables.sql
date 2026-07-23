-- V12__add_missing_enterprise_tables.sql
-- Adds tables that were added via JPA entities but had no corresponding Flyway migration.

-- 1. staff_roles: Many-to-Many join table for Staff <-> Role (multi-skill support)
CREATE TABLE IF NOT EXISTS staff_roles (
    staff_id BIGINT NOT NULL,
    role_id  BIGINT NOT NULL,
    PRIMARY KEY (staff_id, role_id),
    CONSTRAINT fk_staff_roles_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_roles_role  FOREIGN KEY (role_id)  REFERENCES roles(id) ON DELETE CASCADE
);

-- 2. sla_change_requests: Workflow table for Admin -> Super Admin SLA modification requests
CREATE TABLE IF NOT EXISTS sla_change_requests (
    id                                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id                        BIGINT      NOT NULL,
    priority_name                       VARCHAR(50) NOT NULL,
    user_role                           VARCHAR(50) NOT NULL,
    proposed_response_time_limit_minutes  INT        NOT NULL,
    proposed_resolution_time_limit_minutes INT       NOT NULL,
    justification                       TEXT,
    status                              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_notes                         TEXT,
    active                              BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at                          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at                          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sla_change_requests_user FOREIGN KEY (requester_id) REFERENCES users(id)
);

-- 3. assets: Campus asset inventory (hardware, AV, smart classrooms, network gear, etc.)
CREATE TABLE IF NOT EXISTS assets (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    asset_tag     VARCHAR(100) NOT NULL UNIQUE,
    type          VARCHAR(100) NOT NULL,
    location      VARCHAR(255),
    department_id BIGINT       NOT NULL,
    status        VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assets_department FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 4. audit_logs: Enterprise-grade security and change audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    action      VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id   BIGINT       NOT NULL,
    old_value   TEXT,
    new_value   TEXT,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. Seed a few sample campus assets so the asset page is not empty out of the box
INSERT IGNORE INTO assets (id, name, asset_tag, type, location, department_id, status) VALUES
(1,  'Lab 101 Projector',           'AST-AV-101',  'AV',              'Lab 101, Block A, Floor 1', 1, 'ACTIVE'),
(2,  'Smart Board - Seminar Hall',  'AST-SB-SH1',  'SMART_CLASSROOM', 'Seminar Hall, Block B',     1, 'ACTIVE'),
(3,  'Network Switch - Floor 3',    'AST-NW-F3',   'NETWORK',         'Server Room, Floor 3',      1, 'ACTIVE'),
(4,  'Lab 204 Desktop PC Set',      'AST-HW-204',  'HARDWARE',        'Lab 204, Block C',          1, 'ACTIVE'),
(5,  'Library AV System',           'AST-AV-LIB',  'AV',              'Central Library',           2, 'ACTIVE'),
(6,  'Cafeteria HVAC Unit',         'AST-FC-CAF',  'FACILITY',        'Cafeteria, Ground Floor',   2, 'ACTIVE'),
(7,  'Campus WiFi AP - Hostel',     'AST-NW-HSTL', 'NETWORK',         'Hostel Block D',            1, 'MAINTENANCE');
