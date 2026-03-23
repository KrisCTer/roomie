-- Sample data for MySQL (identity-service)
-- This script runs automatically when the MySQL container starts for the first time.

USE roomie;

-- Roles and permissions
INSERT INTO permission (name, description) VALUES
('READ_ALL_DATA', 'Read all data in the system'),
('WRITE_ALL_DATA', 'Write all data in the system'),
('MANAGE_USERS', 'Manage user accounts and roles')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO role (name, description) VALUES
('ADMIN', 'Administrator role with full access'),
('USER', 'Standard user role for renters and landlords')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT IGNORE INTO role_permissions (role_name, permissions_name) VALUES
('ADMIN', 'READ_ALL_DATA'),
('ADMIN', 'WRITE_ALL_DATA'),
('ADMIN', 'MANAGE_USERS');

-- Demo password for all users below: Password@123
INSERT INTO `user` (
	id,
	username,
	password,
	email,
	email_verified,
	phone_number,
	is_active,
	is_banned,
	provider
) VALUES
('admin-uuid-1', 'admin', '$2a$10$wOq2M0uC/GvO/0Y7Y4f4L.3v3Jc.5C1.402w0L/9B6bU2c/kU9.M2', 'admin@roomie.com', true, '+840900000001', true, false, 'LOCAL'),
('user-uuid-1', 'john_doe', '$2a$10$wOq2M0uC/GvO/0Y7Y4f4L.3v3Jc.5C1.402w0L/9B6bU2c/kU9.M2', 'john.doe@roomie.com', true, '+840900000002', true, false, 'LOCAL'),
('landlord-uuid-1', 'landlord_anna', '$2a$10$wOq2M0uC/GvO/0Y7Y4f4L.3v3Jc.5C1.402w0L/9B6bU2c/kU9.M2', 'anna.landlord@roomie.com', true, '+840900000003', true, false, 'LOCAL')
ON DUPLICATE KEY UPDATE
	username = VALUES(username),
	email = VALUES(email),
	phone_number = VALUES(phone_number),
	is_active = VALUES(is_active),
	is_banned = VALUES(is_banned),
	provider = VALUES(provider);

INSERT IGNORE INTO user_roles (user_id, roles_name) VALUES
('admin-uuid-1', 'ADMIN'),
('user-uuid-1', 'USER'),
('landlord-uuid-1', 'USER');
