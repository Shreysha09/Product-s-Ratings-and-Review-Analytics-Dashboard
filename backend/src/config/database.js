const { Pool } = require('pg');
require('dotenv').config();
console.log(`jjj`)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD + '',
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect',async () => {
  console.log('PostgreSQL client connected');
  await pool.query(`
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
          rating DECIMAL(3, 1) CHECK (rating >= 0 AND rating <= 5),
          rating_count INTEGER DEFAULT 0,
          user_name VARCHAR(255),
          review_title VARCHAR(500),
          review_content TEXT,
          helpful_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add rating columns
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1) DEFAULT 0;

      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_product_category 
      ON products(category);

      CREATE INDEX IF NOT EXISTS idx_product_name 
      ON products(product_name);

      CREATE INDEX IF NOT EXISTS idx_product_discount 
      ON products(discount_percentage);

      CREATE INDEX IF NOT EXISTS idx_review_rating 
      ON reviews(rating);

      CREATE INDEX IF NOT EXISTS idx_review_product 
      ON reviews(product_id);

      CREATE INDEX IF NOT EXISTS idx_review_created 
      ON reviews(created_at);

      -- Function for updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Drop trigger if exists
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;

      -- Trigger
      CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});


module.exports = pool;