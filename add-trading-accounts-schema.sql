-- Add trading_accounts table to existing Supabase schema
-- Run this in your Supabase SQL Editor

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

-- Trading accounts table indexes
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_broker ON trading_accounts(broker_name);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_created_at ON trading_accounts(created_at);

-- Check constraint for trading account status
ALTER TABLE trading_accounts ADD CONSTRAINT check_trading_account_status 
CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Closed'));

-- Row Level Security for trading_accounts
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own trading accounts
CREATE POLICY "Users can view own trading accounts" ON trading_accounts
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own trading accounts
CREATE POLICY "Users can insert own trading accounts" ON trading_accounts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own trading accounts
CREATE POLICY "Users can update own trading accounts" ON trading_accounts
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own trading accounts
CREATE POLICY "Users can delete own trading accounts" ON trading_accounts
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trading_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_trading_accounts_updated_at
    BEFORE UPDATE ON trading_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_trading_accounts_updated_at();
