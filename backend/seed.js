import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seedAdmin() {
  const username = 'admin';
  const password = 'Power@09';
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if exists
    const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
    
    if (existing.length > 0) {
      await sql`UPDATE users SET password_hash = ${hashedPassword} WHERE username = ${username}`;
      console.log('Admin şifresi güncellendi.');
    } else {
      const result = await sql`
        INSERT INTO users (username, password_hash) 
        VALUES (${username}, ${hashedPassword}) 
        RETURNING id
      `;
      // Initialize defaults
      await sql`INSERT INTO company_info (user_id) VALUES (${result[0].id})`;
      await sql`INSERT INTO app_parameters (user_id) VALUES (${result[0].id})`;
      console.log('Admin kullanıcısı başarıyla oluşturuldu.');
    }
    
  } catch (err) {
    console.error('Hata:', err);
  }
}

seedAdmin();
