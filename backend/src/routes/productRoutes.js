const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/products', productController.getProducts);
router.get('/products/all', productController.getAllProducts);
router.get('/analytics', productController.getAnalytics);

module.exports = router;