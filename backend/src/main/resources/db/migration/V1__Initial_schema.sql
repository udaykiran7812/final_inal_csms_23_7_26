CREATE TABLE roles (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(50) NOT NULL UNIQUE,
                       description VARCHAR(255),
                       active BOOLEAN NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,

                       role_id BIGINT NOT NULL,

                       first_name VARCHAR(100) NOT NULL,

                       last_name VARCHAR(100),

                       email VARCHAR(150) NOT NULL UNIQUE,

                       password VARCHAR(255) NOT NULL,

                       phone VARCHAR(20),

                       active BOOLEAN NOT NULL DEFAULT TRUE,

                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                       CONSTRAINT fk_users_role
                           FOREIGN KEY(role_id)
                               REFERENCES roles(id)
);

CREATE TABLE departments (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             name VARCHAR(100) NOT NULL UNIQUE,
                             description VARCHAR(255),
                             active BOOLEAN NOT NULL DEFAULT TRUE,
                             created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP
);