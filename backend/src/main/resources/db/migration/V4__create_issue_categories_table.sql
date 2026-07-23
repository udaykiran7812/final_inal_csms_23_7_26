CREATE TABLE issue_categories (
                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                  name VARCHAR(255) NOT NULL UNIQUE,
                                  description VARCHAR(500),
                                  active BOOLEAN DEFAULT TRUE,
                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);