import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  let connection;
  try {
    console.log('🔄 Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Port: ${process.env.DB_PORT || 3306}`);
    console.log(`Database: ${process.env.DB_NAME || 'neon_muonline_guides'}`);
    console.log(`User: ${process.env.DB_USER || 'root'}\n`);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'neon_muonline_guides',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
    });

    console.log('✅ Successfully connected to MySQL!');

    const [rows] = await connection.query('SELECT NOW() as current_time, VERSION() as mysql_version');
    console.log('\n📊 Database info:');
    console.log(`Current time: ${rows[0].current_time}`);
    console.log(`MySQL version: ${rows[0].mysql_version}`);

    // Проверка существующих таблиц
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY table_name;
    `);

    if (tables.length > 0) {
      console.log('\n📋 Existing tables:');
      tables.forEach(row => {
        console.log(`  - ${row.table_name || row.TABLE_NAME}`);
      });
    } else {
      console.log('\n📋 No tables found. Run migrations first.');
    }

    console.log('\n✅ Connection test completed successfully!');
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\n💡 Possible solutions:');
    console.error('  1. Check if MySQL is running');
    console.error('  2. Verify database credentials in .env file');
    console.error('  3. Make sure database exists (run: CREATE DATABASE neon_muonline_guides;)');
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

testConnection();

