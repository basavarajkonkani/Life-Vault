-- ============================================================================
-- COMPLETE LIFEVAULT DATABASE SCHEMA
-- Safe to run multiple times - handles existing constraints and policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    pin_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    account_number TEXT NOT NULL,
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- NOMINEES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    allocation_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    is_executor BOOLEAN DEFAULT false,
    is_backup BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VAULT REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vault_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nominee_id UUID REFERENCES nominees(id) ON DELETE CASCADE,
    nominee_name VARCHAR(100) NOT NULL,
    relation_to_deceased VARCHAR(50) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL,
    death_certificate_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TRADING ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    broker_name VARCHAR(100) NOT NULL,
    client_id VARCHAR(50) NOT NULL,
    demat_number VARCHAR(50) NOT NULL,
    nominee_id UUID REFERENCES nominees(id) ON DELETE SET NULL,
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_nominees_user_id ON nominees(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_requests_nominee_id ON vault_requests(nominee_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_broker ON trading_accounts(broker_name);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_created_at ON trading_accounts(created_at);

-- ============================================================================
-- CONSTRAINTS (Safe Creation)
-- ============================================================================

-- Drop existing trading accounts constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_trading_account_status' 
        AND table_name = 'trading_accounts'
    ) THEN
        ALTER TABLE trading_accounts DROP CONSTRAINT check_trading_account_status;
        RAISE NOTICE 'Dropped existing check_trading_account_status constraint';
    END IF;
END $$;

-- Add trading accounts constraint
ALTER TABLE trading_accounts ADD CONSTRAINT check_trading_account_status 
CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Closed'));

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES (Safe Creation - Drop First, Then Create)
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can register" ON users;
DROP POLICY IF EXISTS "Users can view own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON assets;
DROP POLICY IF EXISTS "Users can update own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON assets;
DROP POLICY IF EXISTS "Users can view own nominees" ON nominees;
DROP POLICY IF EXISTS "Users can insert own nominees" ON nominees;
DROP POLICY IF EXISTS "Users can update own nominees" ON nominees;
DROP POLICY IF EXISTS "Users can delete own nominees" ON nominees;
DROP POLICY IF EXISTS "Anyone can submit vault requests" ON vault_requests;
DROP POLICY IF EXISTS "Users can view own trading accounts" ON trading_accounts;
DROP POLICY IF EXISTS "Users can insert own trading accounts" ON trading_accounts;
DROP POLICY IF EXISTS "Users can update own trading accounts" ON trading_accounts;
DROP POLICY IF EXISTS "Users can delete own trading accounts" ON trading_accounts;

-- Create fresh policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can register" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own assets" ON assets FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own assets" ON assets FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own assets" ON assets FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own assets" ON assets FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own nominees" ON nominees FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own nominees" ON nominees FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own nominees" ON nominees FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own nominees" ON nominees FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can submit vault requests" ON vault_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own trading accounts" ON trading_accounts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own trading accounts" ON trading_accounts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own trading accounts" ON trading_accounts FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own trading accounts" ON trading_accounts FOR DELETE USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp for trading accounts
CREATE OR REPLACE FUNCTION update_trading_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_trading_accounts_updated_at ON trading_accounts;

-- Create the trigger
CREATE TRIGGER trigger_update_trading_accounts_updated_at
    BEFORE UPDATE ON trading_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_trading_accounts_updated_at();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE 'LifeVault complete database schema created successfully!';
    RAISE NOTICE 'Tables: users, assets, nominees, vault_requests, trading_accounts';
    RAISE NOTICE 'All policies and constraints applied safely.';
END $$;

-- Final verification
SELECT 'LifeVault database schema and policies created successfully!' as message;
