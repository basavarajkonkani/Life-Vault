-- Manual fix for trading accounts constraint
-- Run this in Supabase SQL Editor

-- First, check if the constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'trading_accounts' 
AND constraint_name = 'check_trading_account_status';

-- If the constraint exists, drop it
ALTER TABLE trading_accounts DROP CONSTRAINT IF EXISTS check_trading_account_status;

-- Then add the constraint with the correct values
ALTER TABLE trading_accounts ADD CONSTRAINT check_trading_account_status 
CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Closed'));
