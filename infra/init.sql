-- Sample data for MySQL (identity-service)
-- This script runs automatically when the MySQL container starts for the first time.
-- If you need to re-run it, you must delete the mysql_data volume first: 
-- docker-compose down -v

USE roomie;

-- Insert default permissions
INSERT INTO permission (name, description) VALUES 
('READ_ALL_DATA', 'Read all data in the system'),
('WRITE_ALL_DATA', 'Write all data in the system'),
('MANAGE_USERS', 'Manage user accounts and roles');

-- Insert default roles
INSERT INTO role (name, description) VALUES 
('ADMIN', 'Administrator role with full access'),
('USER', 'Standard user role for renters and landlords');

-- Assign permissions to ADMIN role
INSERT INTO role_permissions (role_name, permissions_name) VALUES 
('ADMIN', 'READ_ALL_DATA'),
('ADMIN', 'WRITE_ALL_DATA'),
('ADMIN', 'MANAGE_USERS');

-- Insert sample admin user
-- Password is 'admin123' (bcrypt hashed, assuming standard spring security BCryptPasswordEncoder)
INSERT INTO user (id, username, password, email, email_verified, phone_number, is_active, is_banned, provider) VALUES 
('admin-uuid-1', 'admin', '$2a$10$wOq2M0uC/GvO/0Y7Y4f4L.3v3Jc.5C1.402w0L/9B6bU2c/kU9.M2', 'admin@roomie.com', true, '+1234567890', true, false, 'LOCAL');

-- Assign ADMIN role to the user
INSERT INTO user_roles (user_id, roles_name) VALUES 
('admin-uuid-1', 'ADMIN');

-- Insert sample normal user
-- Password is 'user123' (bcrypt hashed)
INSERT INTO user (id, username, password, email, email_verified, phone_number, is_active, is_banned, provider) VALUES 
('user-uuid-1', 'john_doe', '$2a$10$E9B.vA/1B1C8zY8g1E8C.eE8gO8.1C.2C3yX4z/5D6eF7gH8iJ9.K', 'john.doe@example.com', true, '+0987654321', true, false, 'LOCAL');

-- Assign USER role to the normal user
INSERT INTO user_roles (user_id, roles_name) VALUES 
('user-uuid-1', 'USER');
