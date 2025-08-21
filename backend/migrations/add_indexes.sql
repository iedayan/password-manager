-- Database optimization indexes
-- Add indexes for frequently queried columns

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Passwords table indexes  
CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_passwords_site_name ON passwords(site_name);
CREATE INDEX IF NOT EXISTS idx_passwords_created_at ON passwords(created_at);
CREATE INDEX IF NOT EXISTS idx_passwords_user_site ON passwords(user_id, site_name);

-- Login sessions indexes
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_active ON login_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_login_sessions_created_at ON login_sessions(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_passwords_user_active ON passwords(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);