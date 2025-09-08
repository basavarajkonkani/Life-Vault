-- Trading Accounts Table Schema for LifeVault
-- Run this SQL in your Supabase SQL Editor

-- ============================================================================
-- TRADING ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    broker_name VARCHAR(200) NOT NULL,
    client_id TEXT NOT NULL, -- Broker's account ID
    demat_number TEXT NOT NULL, -- NSDL/CDSL demat account number
    nominee_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Linked nominee
    current_value DECIMAL(15,2) DEFAULT 0, -- Portfolio value (manual entry)
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading accounts table indexes
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_nominee_id ON trading_accounts(nominee_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_broker_name ON trading_accounts(broker_name);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_created_at ON trading_accounts(created_at);

-- Check constraint for trading account status
ALTER TABLE trading_accounts ADD CONSTRAINT check_trading_account_status 
CHECK (status IN ('Active', 'Closed', 'Suspended'));

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on trading_accounts table
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own trading accounts
CREATE POLICY "Users can view own trading accounts" ON trading_accounts
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own trading accounts
CREATE POLICY "Users can insert own trading accounts" ON trading_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own trading accounts
CREATE POLICY "Users can update own trading accounts" ON trading_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own trading accounts
CREATE POLICY "Users can delete own trading accounts" ON trading_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Nominees can view trading accounts assigned to them (after vault approval)
CREATE POLICY "Nominees can view assigned trading accounts" ON trading_accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM vault_requests vr 
            WHERE vr.nominee_id = auth.uid() 
            AND vr.status = 'approved'
            AND vr.nominee_id = trading_accounts.nominee_id
        )
    );

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample trading accounts (uncomment to use)
/*
INSERT INTO trading_accounts (user_id, broker_name, client_id, demat_number, nominee_id, current_value, status) VALUES 
('owner-123', 'Zerodha', 'ZR123456', 'NSDL123456789', 'nominee-123', 150000.00, 'Active'),
('owner-123', 'Upstox', 'UP789012', 'CDSL987654321', 'nominee-123', 75000.00, 'Active'),
('owner-123', 'ICICI Direct', 'IC345678', 'NSDL456789123', NULL, 200000.00, 'Active');
*/
