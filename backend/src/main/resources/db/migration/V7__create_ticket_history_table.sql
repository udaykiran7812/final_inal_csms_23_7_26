CREATE TABLE ticket_history (
                                id BIGINT PRIMARY KEY AUTO_INCREMENT,

                                ticket_id BIGINT NOT NULL,

                                action VARCHAR(255) NOT NULL,

                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

                                active BOOLEAN NOT NULL DEFAULT TRUE,

                                CONSTRAINT fk_ticket_history_ticket
                                    FOREIGN KEY (ticket_id)
                                        REFERENCES tickets(id)
);