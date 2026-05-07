const pool = require('../config/database');

class Review {
  static async getAll(filters = {}) {
    let query = `
      SELECT r.*, p.product_name, p.category, p.discounted_price, p.actual_price
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (filters.product_id && filters.product_id !== '') {
      query += ` AND r.product_id = $${paramIndex}`;
      values.push(filters.product_id);
      paramIndex++;
    }

    if (filters.rating && filters.rating !== '') {
      query += ` AND r.rating >= $${paramIndex} AND r.rating < $${paramIndex + 1}`;
      const rating = parseInt(filters.rating);
      values.push(rating, rating + 1);
      paramIndex += 2;
    }

    if (filters.search && filters.search !== '') {
      query += ` AND (r.review_content ILIKE $${paramIndex} OR r.review_title ILIKE $${paramIndex} OR r.user_name ILIKE $${paramIndex})`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY r.created_at DESC`;

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
    
    let countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      WHERE 1=1
    `;
    const countValues = [];
    let countIndex = 1;
    
    if (filters.product_id && filters.product_id !== '') {
      countQuery += ` AND r.product_id = $${countIndex}`;
      countValues.push(filters.product_id);
      countIndex++;
    }
    
    if (filters.rating && filters.rating !== '') {
      countQuery += ` AND r.rating >= $${countIndex} AND r.rating < $${countIndex + 1}`;
      const rating = parseInt(filters.rating);
      countValues.push(rating, rating + 1);
      countIndex += 2;
    }
    
    if (filters.search && filters.search !== '') {
      countQuery += ` AND (r.review_content ILIKE $${countIndex} OR r.review_title ILIKE $${countIndex} OR r.user_name ILIKE $${countIndex})`;
      countValues.push(`%${filters.search}%`);
      countIndex++;
    }
    
    const countResult = await pool.query(countQuery, countValues);
    
    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  static async getRatingDistribution(product_id = null) {
    let query = `
      SELECT 
        FLOOR(rating) as rating_star,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
      FROM reviews
      WHERE 1=1
    `;
    const values = [];
    
    if (product_id) {
      query += ` AND product_id = $1`;
      values.push(product_id);
    }
    
    query += ` GROUP BY FLOOR(rating) ORDER BY rating_star DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getRecentReviews(limit = 10) {
    const query = `
      SELECT r.*, p.product_name, p.category
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      ORDER BY r.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async getReviewStats() {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating,
        COUNT(DISTINCT product_id) as products_reviewed,
        COUNT(DISTINCT user_name) as unique_reviewers
      FROM reviews
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Review;