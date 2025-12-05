import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'neon_muonline_guides',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runSeeds() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`\n📁 Found ${files.length} seed files\n`);

    for (const file of files) {
      console.log(`⏳ Running seed: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    console.log('🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeeds();

