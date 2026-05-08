const Review = require('../models/review');

class ReviewController {
  async getReviews(req, res) {
    try {
      const { page = 1, limit = 10, search, rating, product_id } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        search,
        rating,
        product_id,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const result = await Review.getAll(filters);
      res.json({
        success: true,
        data: result.data,
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.total
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  async getRatingDistribution(req, res) {
    try {
      const { product_id } = req.query;
      const distribution = await Review.getRatingDistribution(product_id);
      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      console.error('Error fetching rating distribution:', error);
      res.status(500).json({ error: 'Failed to fetch rating distribution' });
    }
  }

  async getRecentReviews(req, res) {
    try {
      const { limit = 10 } = req.query;
      const reviews = await Review.getRecentReviews(parseInt(limit));
      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
      res.status(500).json({ error: 'Failed to fetch recent reviews' });
    }
  }

  async getReviewStats(req, res) {
    try {
      const stats = await Review.getReviewStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
      res.status(500).json({ error: 'Failed to fetch review stats' });
    }
  }
}

module.exports = new ReviewController();