-- Fix trading accounts constraint error
-- This script safely handles existing constraints

-- Drop the constraint if it exists, then recreate it
DO $$ 
BEGIN
    -- Drop constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_trading_account_status' 
        AND table_name = 'trading_accounts'
    ) THEN
        ALTER TABLE trading_accounts DROP CONSTRAINT check_trading_account_status;
    END IF;
    
    -- Add the constraint
    ALTER TABLE trading_accounts ADD CONSTRAINT check_trading_account_status 
    CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Closed'));
    
    RAISE NOTICE 'Trading accounts constraint updated successfully';
END $$;
