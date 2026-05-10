const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const JWT_SECRET = 'reklamcu_gizli_anahtar_99';

app.use(cors());
app.use(express.json());

async function startServer(dbPath = './database.sqlite') {
  let db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create Tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS company_info (
      user_id INTEGER PRIMARY KEY,
      name TEXT DEFAULT 'Siento Creative',
      slogan TEXT DEFAULT 'PROFESYONEL REKLAM VE TABELA ÇÖZÜMLERİ',
      email TEXT DEFAULT 'info@sientocreative.com',
      website TEXT DEFAULT 'www.sientocreative.com',
      logo TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS app_parameters (
      user_id INTEGER PRIMARY KEY,
      tax_rate NUMERIC DEFAULT 20,
      profit_margin NUMERIC DEFAULT 0,
      labor_rate NUMERIC DEFAULT 0,
      materials TEXT,
      letter_types TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS recent_customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      address TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Auto-seed Admin
  const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const hashed = await bcrypt.hash('admin123', 10);
    const result = await db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['admin', hashed]);
    await db.run('INSERT INTO company_info (user_id) VALUES (?)', [result.lastID]);
    await db.run('INSERT INTO app_parameters (user_id) VALUES (?)', [result.lastID]);
    console.log('Admin hesabı oluşturuldu (admin / Power@09)');
  }

  // --- Auth Routes ---
  app.post('/api/auth/register', async (req, res) => {
    const { username, password, companyName, email, slogan, website, logo } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const result = await db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashed]);
      
      // Update company_info with provided data
      await db.run(
        'INSERT INTO company_info (user_id, name, slogan, email, website, logo) VALUES (?, ?, ?, ?, ?, ?)', 
        [result.lastID, companyName || 'Firma Adı', slogan || '', email || '', website || '', logo || null]
      );
      
      // Also initialize app_parameters
      await db.run('INSERT INTO app_parameters (user_id) VALUES (?)', [result.lastID]);
      
      res.status(201).json({ message: 'Kayıt başarılı' });
    } catch (e) {
      console.error("Register Error:", e);
      res.status(400).json({ message: 'Kullanıcı adı kullanımda veya geçersiz veri' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(400).json({ message: 'Hatalı kullanıcı adı veya şifre' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username } });
  });

  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Yetkisiz erişim' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Geçersiz oturum' });
      req.user = user;
      next();
    });
  };

  app.get('/api/settings', authenticateToken, async (req, res) => {
    const company = await db.get('SELECT * FROM company_info WHERE user_id = ?', [req.user.id]);
    const params = await db.get('SELECT * FROM app_parameters WHERE user_id = ?', [req.user.id]);
    const materials = params?.materials ? JSON.parse(params.materials) : null;
    if (materials) {
      delete materials.front;
      delete materials.side;
    }
    
    res.json({ 
      companyInfo: company || {}, 
      parameters: params || {},
      materials: materials,
      letterTypes: params?.letter_types ? JSON.parse(params.letter_types) : null
    });
  });

  app.post('/api/settings/company', authenticateToken, async (req, res) => {
    const { name, slogan, email, website, logo } = req.body;
    await db.run(
      'UPDATE company_info SET name=?, slogan=?, email=?, website=?, logo=? WHERE user_id=?',
      [name, slogan, email, website, logo, req.user.id]
    );
    res.json({ message: 'Güncellendi' });
  });

  app.post('/api/settings/parameters', authenticateToken, async (req, res) => {
    const { tax_rate, profit_margin, labor_rate, materials, letter_types } = req.body;
    
    const exists = await db.get('SELECT user_id FROM app_parameters WHERE user_id = ?', [req.user.id]);
    if (!exists) {
      await db.run('INSERT INTO app_parameters (user_id) VALUES (?)', [req.user.id]);
    }

    await db.run(
      'UPDATE app_parameters SET tax_rate=?, profit_margin=?, labor_rate=?, materials=?, letter_types=? WHERE user_id=?',
      [tax_rate, profit_margin, labor_rate, JSON.stringify(materials), JSON.stringify(letter_types), req.user.id]
    );
    res.json({ message: 'Güncellendi' });
  });

  // --- Recent Customers API ---
  app.get('/api/recent-customers', authenticateToken, async (req, res) => {
    const list = await db.all(
      'SELECT name, address FROM recent_customers WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5',
      [req.user.id]
    );
    res.json(list);
  });

  app.post('/api/recent-customers', authenticateToken, async (req, res) => {
    const { name, address } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Geçersiz isim' });

    // Check if exists to update timestamp or insert new
    const existing = await db.get(
      'SELECT id FROM recent_customers WHERE user_id = ? AND LOWER(name) = LOWER(?)',
      [req.user.id, name]
    );

    if (existing) {
      await db.run(
        'UPDATE recent_customers SET address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [address, existing.id]
      );
    } else {
      await db.run(
        'INSERT INTO recent_customers (user_id, name, address) VALUES (?, ?, ?)',
        [req.user.id, name, address]
      );
    }

    // Keep only last 10 in DB to save space, show last 5 in UI
    await db.run(
      'DELETE FROM recent_customers WHERE user_id = ? AND id NOT IN (SELECT id FROM recent_customers WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10)',
      [req.user.id, req.user.id]
    );

    res.json({ success: true });
  });

  return new Promise((resolve) => {
    const server = app.listen(5000, '0.0.0.0', () => {
      console.log(`Backend server running on port: 5000`);
      resolve(server);
    });
  });
}

module.exports = { startServer };
