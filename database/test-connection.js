import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'neon_muonline_guides',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    console.log('🔄 Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Port: ${process.env.DB_PORT || 5432}`);
    console.log(`Database: ${process.env.DB_NAME || 'neon_muonline_guides'}`);
    console.log(`User: ${process.env.DB_USER || 'postgres'}\n`);

    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('\n📊 Database info:');
    console.log(`Current time: ${result.rows[0].current_time}`);
    console.log(`PostgreSQL version: ${result.rows[0].pg_version}`);

    // Проверка существующих таблиц
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length > 0) {
      console.log('\n📋 Existing tables:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('\n📋 No tables found. Run migrations first.');
    }

    console.log('\n✅ Connection test completed successfully!');
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\n💡 Possible solutions:');
    console.error('  1. Check if PostgreSQL is running');
    console.error('  2. Verify database credentials in .env file');
    console.error('  3. Make sure database exists (run: CREATE DATABASE neon_muonline_guides;)');
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();

