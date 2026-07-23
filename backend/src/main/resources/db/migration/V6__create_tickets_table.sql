CREATE TABLE tickets (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,

                         title VARCHAR(255) NOT NULL,
                         description TEXT NOT NULL,

                         status VARCHAR(30) NOT NULL,
                         priority VARCHAR(30) NOT NULL,

                         user_id BIGINT NOT NULL,
                         department_id BIGINT NOT NULL,
                         issue_category_id BIGINT NOT NULL,
                         assigned_staff_id BIGINT NULL,

                         active BOOLEAN DEFAULT TRUE,

                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,

                         CONSTRAINT fk_ticket_user
                             FOREIGN KEY (user_id)
                                 REFERENCES users(id),

                         CONSTRAINT fk_ticket_department
                             FOREIGN KEY (department_id)
                                 REFERENCES departments(id),

                         CONSTRAINT fk_ticket_issue_category
                             FOREIGN KEY (issue_category_id)
                                 REFERENCES issue_categories(id),

                         CONSTRAINT fk_ticket_staff
                             FOREIGN KEY (assigned_staff_id)
                                 REFERENCES staff(id)
);