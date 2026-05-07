const XLSX = require('xlsx');
const pool = require('../config/database');

class UploadController {
  async uploadFile(req, res) {
    let client;
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        return res.status(400).json({ error: 'File contains no data' });
      }

      client = await pool.connect();
      await client.query('BEGIN');

      let productsCount = 0;
      let reviewsCount = 0;
      let skippedRows = 0;

      for (const row of data) {
        try {
          // Extract data with correct column mapping
          const product_id = row.product_id || row.PRODUCT_ID;
          let product_name = row.product_name || row.PRODUCT_NAME || '';
          
          // Clean product name - remove special characters and truncate if needed
          product_name = product_name.replace(/[^\w\s\-\(\)]/g, '').substring(0, 500);
          
          let category = row.category || row.CATEGORY || '';
          // Take first category if multiple (pipe-separated)
          if (category && category.includes('|')) {
            category = category.split('|')[0];
          }
          
          // Parse prices - remove ₹ symbol and commas
          let actual_price = row.actual_price || row.ACTUAL_PRICE || '0';
          let discounted_price = row.discounted_price || row.DISCOUNTED_PRICE || '0';
          
          // Remove currency symbols and convert to number
          actual_price = parseFloat(String(actual_price).replace(/[₹,]/g, '')) || 0;
          discounted_price = parseFloat(String(discounted_price).replace(/[₹,]/g, '')) || 0;
          
          const discount_percentage = parseFloat(row.discount_percentage || row.DISCOUNT_PERCENTAGE || 0);
          
          // Parse rating - remove commas if present
          let rating = row.rating || row.RATING || '0';
          rating = parseFloat(String(rating).replace(/,/g, '')) || 0;
          
          // Parse rating count - remove commas
          let rating_count = row.rating_count || row.RATING_COUNT || '0';
          rating_count = parseInt(String(rating_count).replace(/,/g, '')) || 0;
          
          const about_product = row.about_product || row.ABOUT_PRODUCT || '';
          
          // Handle multiple user names (pipe-separated)
          let user_name = row.user_name || row.USER_NAME || 'Anonymous';
          if (user_name && user_name.includes('|')) {
            user_name = user_name.split('|')[0];
          }
          // Remove any URLs or special characters from user name
          user_name = user_name.replace(/https?:\/\/[^\s]+/g, '').trim();
          
          let review_title = row.review_title || row.REVIEW_TITLE || '';
          // Remove URLs from review title
          review_title = review_title.replace(/https?:\/\/[^\s]+/g, '').trim();
          
          let review_content = row.review_content || row.REVIEW_CONTENT || '';
          // Remove URLs from review content
          review_content = review_content.replace(/https?:\/\/[^\s]+/g, '').trim();
          
          // Truncate review content if too long
          if (review_content.length > 1000) {
            review_content = review_content.substring(0, 1000);
          }

          // Insert or update product
          if (product_id && product_name) {
            await client.query(
              `INSERT INTO products (product_id, product_name, category, actual_price, discounted_price, discount_percentage, about_product)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (product_id) DO UPDATE SET
               product_name = EXCLUDED.product_name,
               category = EXCLUDED.category,
               actual_price = EXCLUDED.actual_price,
               discounted_price = EXCLUDED.discounted_price,
               discount_percentage = EXCLUDED.discount_percentage,
               about_product = EXCLUDED.about_product,
               updated_at = CURRENT_TIMESTAMP`,
              [product_id, product_name, category, actual_price, discounted_price || actual_price, discount_percentage, about_product.substring(0, 1000)]
            );
            productsCount++;
          }

          // Insert review if rating exists
          if (product_id && rating > 0) {
            const review_id = `${product_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await client.query(
              `INSERT INTO reviews (review_id, product_id, rating, review_title, review_content, user_name, helpful_count, rating_count)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT (review_id) DO NOTHING`,
              [review_id, product_id, rating, review_title.substring(0, 500), review_content, user_name.substring(0, 255), 0, rating_count]
            );
            reviewsCount++;
          }
        } catch (rowError) {
          console.error('Error processing row:', rowError);
          skippedRows++;
        }
      }

      await client.query('COMMIT');
      
      res.json({ 
        success: true,
        message: 'File uploaded successfully', 
        productsCount,
        reviewsCount,
        totalRows: data.length,
        skippedRows
      });
    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to process file: ' + error.message });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}

module.exports = new UploadController();