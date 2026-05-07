const Product = require('../models/Product');

class ProductController {
  async getProducts(req, res) {
    try {
      const { page = 1, limit = 10, search, category, minRating } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        search,
        category,
        minRating,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const result = await Product.getAll(filters);
      res.json({
        success: true,
        data: result.data,
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await Product.getAllProducts();
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error fetching all products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  async getAnalytics(req, res) {
    try {
      const [
        categories,
        productsPerCategory,
        topReviewedProducts,
        discountDistribution,
        categoryWiseRating,
        productStats
      ] = await Promise.all([
        Product.getCategories(),
        Product.getProductsPerCategory(),
        Product.getTopReviewedProducts(5),
        Product.getDiscountDistribution(),
        Product.getCategoryWiseAverageRating(),
        Product.getProductStats()
      ]);

      res.json({
        success: true,
        categories: categories || [],
        productsPerCategory: productsPerCategory || [],
        topReviewedProducts: topReviewedProducts || [],
        discountDistribution: discountDistribution || [],
        categoryWiseRating: categoryWiseRating || [],
        productStats: productStats || {}
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
}

module.exports = new ProductController();