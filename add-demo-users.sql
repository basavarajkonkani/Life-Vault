-- Add demo users to Supabase database
-- Run this in your Supabase SQL Editor

-- Insert demo owner user
INSERT INTO users (id, name, phone, email, role, pin_hash, is_active) VALUES 
('owner-123', 'John Doe', '+91 9876543210', 'john@example.com', 'owner', '$2b$10$rQZ8K9mN2pL1oI3uY6vB7eC4dF5gH8jK2lM9nP6qR3sT7uV1wX4yZ', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  pin_hash = EXCLUDED.pin_hash,
  is_active = EXCLUDED.is_active;

-- Insert demo nominee user
INSERT INTO users (id, name, phone, email, role, pin_hash, is_active, created_by) VALUES 
('nominee-123', 'Jane Doe', '+91 9876543211', 'jane@example.com', 'nominee', NULL, true, 'owner-123')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  pin_hash = EXCLUDED.pin_hash,
  is_active = EXCLUDED.is_active,
  created_by = EXCLUDED.created_by;

-- Insert demo admin user
INSERT INTO users (id, name, phone, email, role, pin_hash, is_active) VALUES 
('admin-123', 'Super Admin', '+91 9999999999', 'admin@lifevault.com', 'admin', '$2b$10$rQZ8K9mN2pL1oI3uY6vB7eC4dF5gH8jK2lM9nP6qR3sT7uV1wX4yZ', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  pin_hash = EXCLUDED.pin_hash,
  is_active = EXCLUDED.is_active;

-- Verify users were created
SELECT id, name, phone, email, role, is_active FROM users WHERE id IN ('owner-123', 'nominee-123', 'admin-123');
