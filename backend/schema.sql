-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Company Information (Branding)
CREATE TABLE IF NOT EXISTS company_info (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Siento Creative',
    slogan TEXT DEFAULT 'PROFESYONEL REKLAM VE TABELA ÇÖZÜMLERİ',
    email TEXT DEFAULT 'info@sientocreative.com',
    website TEXT DEFAULT 'www.sientocreative.com',
    logo TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. App Parameters (Tax, Profit, etc)
CREATE TABLE IF NOT EXISTS app_parameters (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    tax_rate NUMERIC DEFAULT 20,
    profit_margin NUMERIC DEFAULT 0,
    labor_rate NUMERIC DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sample Data (Optional first user)
-- INSERT INTO users (username, password_hash) VALUES ('admin', 'admin123'); -- In production, use hashed passwords!
