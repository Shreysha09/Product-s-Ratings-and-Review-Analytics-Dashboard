const pool = require('../config/database');

class Product {
  static async getAll(filters = {}) {
    let query = `
      SELECT p.*, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(DISTINCT r.id) as review_count,
             MAX(r.rating_count) as total_ratings
      FROM products p
      LEFT JOIN reviews r ON p.product_id = r.product_id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.category && filters.category !== '') {
      query += ` AND p.category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    if (filters.minRating && filters.minRating !== '') {
      query += ` GROUP BY p.id, p.product_id, p.product_name, p.category, p.actual_price, p.discounted_price, p.discount_percentage, p.about_product, p.created_at, p.updated_at
                HAVING COALESCE(AVG(r.rating), 0) >= $${paramIndex}`;
      values.push(parseFloat(filters.minRating));
      paramIndex++;
    } else {
      query += ` GROUP BY p.id, p.product_id, p.product_name, p.category, p.actual_price, p.discounted_price, p.discount_percentage, p.about_product, p.created_at, p.updated_at`;
    }

    if (filters.search && filters.search !== '') {
      query += ` AND p.product_name ILIKE $${paramIndex}`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(parseInt(filters.limit));
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      values.push(parseInt(filters.offset));
    }

    const result = await pool.query(query, values);
    
    let countQuery = `SELECT COUNT(DISTINCT p.id) as total FROM products p WHERE 1=1`;
    const countValues = [];
    let countIndex = 1;
    
    if (filters.category && filters.category !== '') {
      countQuery += ` AND p.category = $${countIndex}`;
      countValues.push(filters.category);
      countIndex++;
    }
    
    if (filters.search && filters.search !== '') {
      countQuery += ` AND p.product_name ILIKE $${countIndex}`;
      countValues.push(`%${filters.search}%`);
      countIndex++;
    }
    
    const countResult = await pool.query(countQuery, countValues);
    
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  static async getAllProducts() {
    const query = `SELECT product_id, product_name, category, discounted_price FROM products ORDER BY product_name LIMIT 100`;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getCategories() {
    const query = `SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' AND category NOT LIKE '%|%' ORDER BY category`;
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  }

  static async getProductsPerCategory() {
    const query = `
      SELECT 
        CASE 
          WHEN category LIKE '%|%' THEN SPLIT_PART(category, '|', 1)
          ELSE category 
        END as category_clean,
        COUNT(*) as count 
      FROM products 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category_clean
      ORDER BY count DESC
      LIMIT 10
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getTopReviewedProducts(limit = 5) {
    const query = `
      SELECT p.product_name, 
             p.category, 
             COUNT(DISTINCT r.id) as review_count,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             p.discounted_price,
             p.discount_percentage
      FROM products p
      LEFT JOIN reviews r ON p.product_id = r.product_id
      GROUP BY p.id, p.product_name, p.category, p.discounted_price, p.discount_percentage
      ORDER BY review_count DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async getDiscountDistribution() {
    const query = `
      SELECT 
        CASE 
          WHEN discount_percentage = 0 THEN '0%'
          WHEN discount_percentage <= 10 THEN '1-10%'
          WHEN discount_percentage <= 20 THEN '11-20%'
          WHEN discount_percentage <= 30 THEN '21-30%'
          WHEN discount_percentage <= 40 THEN '31-40%'
          WHEN discount_percentage <= 50 THEN '41-50%'
          WHEN discount_percentage <= 60 THEN '51-60%'
          WHEN discount_percentage <= 70 THEN '61-70%'
          WHEN discount_percentage <= 80 THEN '71-80%'
          ELSE '80%+'
        END as discount_range,
        COUNT(*) as count,
        MIN(discount_percentage) as min_discount
      FROM products
      GROUP BY discount_range
      ORDER BY min_discount
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getCategoryWiseAverageRating() {
    const query = `
      SELECT 
        CASE 
          WHEN p.category LIKE '%|%' THEN SPLIT_PART(p.category, '|', 1)
          ELSE p.category 
        END as category,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as total_reviews,
        COUNT(DISTINCT p.id) as total_products,
        ROUND(COALESCE(AVG(p.discount_percentage), 0)) as avg_discount
      FROM products p
      LEFT JOIN reviews r ON p.product_id = r.product_id
      WHERE p.category IS NOT NULL AND p.category != ''
      GROUP BY category
      ORDER BY avg_rating DESC
      LIMIT 10
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getProductStats() {
    const query = `
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT r.id) as total_reviews,
        COALESCE(AVG(r.rating), 0) as overall_avg_rating,
        SUM(CASE WHEN r.rating >= 4 THEN 1 ELSE 0 END) as positive_reviews,
        SUM(CASE WHEN r.rating <= 2 THEN 1 ELSE 0 END) as negative_reviews,
        COALESCE(AVG(p.discount_percentage), 0) as avg_discount,
        MAX(p.discount_percentage) as max_discount,
        MIN(p.discount_percentage) as min_discount
      FROM products p
      LEFT JOIN reviews r ON p.product_id = r.product_id
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Product;