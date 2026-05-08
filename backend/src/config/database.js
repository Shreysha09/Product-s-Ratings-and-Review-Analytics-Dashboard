require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: 'turntable.proxy.rlwy.net',
  port: 58605,
  user: 'postgres',
  password: 'lOmXAQYLkwenBcORMmjcUpJyuyEOHJgT',
  database: 'railway',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


// Check DB connection + initialize tables
const initializeDatabase = async () => {
  let client;

  try {
    client = await pool.connect();

    console.log('✅ PostgreSQL Database Connected Successfully');

    await client.query(`
      -- Drop existing tables if they exist
      DROP TABLE IF EXISTS reviews;
      DROP TABLE IF EXISTS products;

      -- Create Products Table
      CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          product_id VARCHAR(100) UNIQUE NOT NULL,
          product_name TEXT NOT NULL,
          category VARCHAR(200),
          actual_price DECIMAL(10, 2) DEFAULT 0,
          discounted_price DECIMAL(10, 2) DEFAULT 0,
          discount_percentage DECIMAL(5, 2) DEFAULT 0,
          about_product TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create Reviews Table
      CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          review_id VARCHAR(100) UNIQUE NOT NULL,
          product_id VARCHAR(100) REFERENCES products(product_id) ON DELETE CASCADE,
          rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 5),
          rating_count INTEGER DEFAULT 0,
          user_name VARCHAR(255),
          review_title VARCHAR(500),
          review_content TEXT,
          helpful_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1) DEFAULT 0;

      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
    `);

    console.log('✅ Database Tables Initialized Successfully');

  } catch (error) {
    console.error('❌ Database Connection Failed');
    console.error(error.message);

  } finally {
    if (client) {
      client.release();
    }
  }
};

// Run on startup
initializeDatabase();

// Handle unexpected pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL Pool Error:', err);
  process.exit(-1);
});

module.exports = pool;