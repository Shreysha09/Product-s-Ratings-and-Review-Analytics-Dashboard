const express = require('express');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.get('/reviews', reviewController.getReviews);
router.get('/reviews/distribution', reviewController.getRatingDistribution);
router.get('/reviews/recent', reviewController.getRecentReviews);
router.get('/reviews/stats', reviewController.getReviewStats);

module.exports = router;