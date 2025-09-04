-- LifeVault Database Schema for Multi-Role Authentication
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET row_security = on;

-- ============================================================================
-- USERS TABLE (Updated for Multi-Role Support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    pin_hash VARCHAR(255), -- NULL for nominees (they don't have PIN)
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'owner' CHECK (role IN ('owner', 'nominee', 'admin')),
    encryption_key TEXT,
    created_by UUID REFERENCES users(id), -- For tracking who created this user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    account_number TEXT NOT NULL, -- Will be encrypted in app
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT, -- Will be encrypted in app
    documents JSONB DEFAULT '[]'::jsonb,
    maturity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table indexes
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- ============================================================================
-- ASSET NOMINEE MAPPING TABLE (for role-based access)
-- ============================================================================
CREATE TABLE IF NOT EXISTS asset_nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    nominee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allocation_percentage DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    is_primary_nominee BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(asset_id, nominee_id)
);

-- Asset nominees table indexes
CREATE INDEX IF NOT EXISTS idx_asset_nominees_asset_id ON asset_nominees(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_nominees_nominee_id ON asset_nominees(nominee_id);

-- ============================================================================
-- VAULT REQUESTS TABLE (Updated for Admin Approval)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vault_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nominee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    death_certificate_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'expired')),
    admin_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    vault_opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault requests table indexes
CREATE INDEX IF NOT EXISTS idx_vault_requests_nominee_id ON vault_requests(nominee_id);
CREATE INDEX IF NOT EXISTS idx_vault_requests_owner_id ON vault_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_vault_requests_status ON vault_requests(status);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert super admin user (PIN: 1234)
INSERT INTO users (id, name, phone, email, role, pin_hash, is_active) VALUES 
('00000000-0000-0000-0000-000000000001', 'Super Admin', '+91 9999999999', 'admin@lifevault.com', 'admin', '$2b$10$rQZ8K9mN2pL1oI3uY6vB7eC4dF5gH8jK2lM9nP6qR3sT7uV1wX4yZ', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample owner user (PIN: 1234)
INSERT INTO users (id, name, phone, email, role, pin_hash, is_active) VALUES 
('00000000-0000-0000-0000-000000000002', 'John Doe', '+91 9876543210', 'john@example.com', 'owner', '$2b$10$rQZ8K9mN2pL1oI3uY6vB7eC4dF5gH8jK2lM9nP6qR3sT7uV1wX4yZ', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample nominee user (no PIN)
INSERT INTO users (id, name, phone, email, role, pin_hash, is_active, created_by) VALUES 
('00000000-0000-0000-0000-000000000003', 'Jane Doe', '+91 9876543211', 'jane@example.com', 'nominee', NULL, true, '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
