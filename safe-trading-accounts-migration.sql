-- Safe Trading Accounts Migration
-- This script can be run multiple times without errors

-- ============================================================================
-- TRADING ACCOUNTS TABLE (Safe Creation)
-- ============================================================================

-- Create table if it doesn't exist
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_broker ON trading_accounts(broker_name);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_created_at ON trading_accounts(created_at);

-- ============================================================================
-- SAFE CONSTRAINT CREATION
-- ============================================================================

-- Drop existing constraint if it exists
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

-- Add the constraint
ALTER TABLE trading_accounts ADD CONSTRAINT check_trading_account_status 
CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Closed'));

-- ============================================================================
-- ROW LEVEL SECURITY (Safe Setup)
-- ============================================================================

-- Enable RLS
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own trading accounts" ON trading_accounts;
DROP POLICY IF EXISTS "Users can insert own trading accounts" ON trading_accounts;
DROP POLICY IF EXISTS "Users can update own trading accounts" ON trading_accounts;
DROP POLICY IF EXISTS "Users can delete own trading accounts" ON trading_accounts;

-- Create policies
CREATE POLICY "Users can view own trading accounts" ON trading_accounts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own trading accounts" ON trading_accounts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own trading accounts" ON trading_accounts
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own trading accounts" ON trading_accounts
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- TRIGGERS (Safe Creation)
-- ============================================================================

-- Create or replace the update function
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

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Trading accounts migration completed successfully!';
END $$;
