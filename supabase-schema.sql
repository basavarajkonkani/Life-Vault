-- LifeVault Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET row_security = on;

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
    encryption_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

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
    nominee VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table indexes
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);

-- Check constraint for asset categories
ALTER TABLE assets ADD CONSTRAINT check_asset_category 
CHECK (category IN ('Bank', 'LIC', 'PF', 'Property', 'Stocks', 'Crypto', 'Mutual Funds', 'FD', 'Bonds', 'Other'));

-- Check constraint for asset status
ALTER TABLE assets ADD CONSTRAINT check_asset_status 
CHECK (status IN ('Active', 'Inactive', 'Matured', 'Closed', 'Expired'));

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
    allocation_percentage DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    is_executor BOOLEAN DEFAULT false,
    is_backup BOOLEAN DEFAULT false,
    address TEXT,
    id_proof_type VARCHAR(100),
    id_proof_number TEXT, -- Will be encrypted in app
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nominees table indexes
CREATE INDEX IF NOT EXISTS idx_nominees_user_id ON nominees(user_id);
CREATE INDEX IF NOT EXISTS idx_nominees_relation ON nominees(relation);
CREATE INDEX IF NOT EXISTS idx_nominees_executor ON nominees(is_executor);
CREATE INDEX IF NOT EXISTS idx_nominees_created_at ON nominees(created_at);

-- Check constraint for nominee relations
ALTER TABLE nominees ADD CONSTRAINT check_nominee_relation 
CHECK (relation IN ('Spouse', 'Child', 'Parent', 'Sibling', 'Other', 'Friend', 'Relative'));

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
    admin_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    vault_opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault requests table indexes
CREATE INDEX IF NOT EXISTS idx_vault_requests_nominee_id ON vault_requests(nominee_id);
CREATE INDEX IF NOT EXISTS idx_vault_requests_status ON vault_requests(status);
CREATE INDEX IF NOT EXISTS idx_vault_requests_created_at ON vault_requests(created_at);

-- Check constraint for vault request status
ALTER TABLE vault_requests ADD CONSTRAINT check_vault_request_status 
CHECK (status IN ('pending', 'under_review', 'verified', 'rejected', 'expired'));

-- ============================================================================
-- DOCUMENTS TABLE (for file metadata)
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    vault_request_id UUID REFERENCES vault_requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    file_url TEXT,
    document_type VARCHAR(50), -- 'asset_document', 'death_certificate', 'id_proof', etc.
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_asset_id ON documents(asset_id);
CREATE INDEX IF NOT EXISTS idx_documents_vault_request_id ON documents(vault_request_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

-- ============================================================================
-- AUDIT LOG TABLE (for tracking changes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Assets policies
CREATE POLICY "Users can view own assets" ON assets FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own assets" ON assets FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own assets" ON assets FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own assets" ON assets FOR DELETE USING (auth.uid()::text = user_id::text);

-- Nominees policies
CREATE POLICY "Users can view own nominees" ON nominees FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own nominees" ON nominees FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own nominees" ON nominees FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own nominees" ON nominees FOR DELETE USING (auth.uid()::text = user_id::text);

-- Vault requests policies (more complex - nominees can view related requests)
CREATE POLICY "Users can view vault requests" ON vault_requests FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM nominees 
        WHERE nominees.id = vault_requests.nominee_id 
        AND nominees.user_id::text = auth.uid()::text
    )
);

CREATE POLICY "Anyone can insert vault requests" ON vault_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update vault requests" ON vault_requests FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM nominees 
        WHERE nominees.id = vault_requests.nominee_id 
        AND nominees.user_id::text = auth.uid()::text
    )
);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid()::text = user_id::text);

-- Audit logs policies (read-only for users)
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nominees_updated_at BEFORE UPDATE ON nominees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vault_requests_updated_at BEFORE UPDATE ON vault_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate nominee allocation percentage
CREATE OR REPLACE FUNCTION validate_nominee_allocation()
RETURNS TRIGGER AS $$
DECLARE
    total_allocation DECIMAL(5,2);
BEGIN
    -- Calculate total allocation for the user
    SELECT COALESCE(SUM(allocation_percentage), 0) 
    INTO total_allocation
    FROM nominees 
    WHERE user_id = NEW.user_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    -- Check if total would exceed 100%
    IF (total_allocation + NEW.allocation_percentage) > 100 THEN
        RAISE EXCEPTION 'Total nominee allocation cannot exceed 100%%. Current total: %%, Attempting to add: %%', 
            total_allocation, NEW.allocation_percentage;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for nominee allocation validation
CREATE TRIGGER validate_nominee_allocation_trigger 
    BEFORE INSERT OR UPDATE ON nominees 
    FOR EACH ROW EXECUTE FUNCTION validate_nominee_allocation();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage bucket for documents (run this in Supabase Dashboard -> Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Storage policies for documents bucket
-- CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
-- CREATE POLICY "Users can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
-- CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment below to insert sample data for testing

/*
-- Sample user (password: test123, PIN: 1234)
INSERT INTO users (id, name, phone, email, address, pin_hash, is_active, role) VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'John Doe',
    '+91 9876543210',
    'john.doe@example.com',
    '123 Main Street, Mumbai, Maharashtra 400001',
    '$2b$10$example.hash.for.pin.1234', -- This should be properly hashed
    true,
    'user'
);

-- Sample assets
INSERT INTO assets (user_id, category, institution, account_number, current_value, status, notes) VALUES 
(
    '123e4567-e89b-12d3-a456-426614174000',
    'Bank',
    'State Bank of India',
    '****1234',
    500000,
    'Active',
    'Primary savings account'
),
(
    '123e4567-e89b-12d3-a456-426614174000',
    'LIC',
    'LIC of India',
    '****5678',
    625000,
    'Active',
    'Life insurance policy'
);

-- Sample nominees
INSERT INTO nominees (user_id, name, relation, phone, email, allocation_percentage, is_executor, is_backup) VALUES 
(
    '123e4567-e89b-12d3-a456-426614174000',
    'Jane Doe',
    'Spouse',
    '+91 9876543210',
    'jane@example.com',
    60,
    true,
    false
),
(
    '123e4567-e89b-12d3-a456-426614174000',
    'John Doe Jr.',
    'Child',
    '+91 9876543211',
    'john.jr@example.com',
    40,
    false,
    false
);
*/

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Create a view for easy querying
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    COUNT(DISTINCT a.id) as total_assets,
    COUNT(DISTINCT n.id) as total_nominees,
    COALESCE(SUM(a.current_value), 0) as net_worth,
    u.created_at as user_since
FROM users u
LEFT JOIN assets a ON u.id = a.user_id AND a.status = 'Active'
LEFT JOIN nominees n ON u.id = n.user_id
GROUP BY u.id, u.name, u.email, u.phone, u.created_at;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'LifeVault database schema created successfully!';
    RAISE NOTICE 'Tables created: users, assets, nominees, vault_requests, documents, audit_logs';
    RAISE NOTICE 'Indexes, constraints, and triggers are in place';
    RAISE NOTICE 'Row Level Security (RLS) policies are configured';
    RAISE NOTICE 'Ready for Supabase integration!';
END $$; 