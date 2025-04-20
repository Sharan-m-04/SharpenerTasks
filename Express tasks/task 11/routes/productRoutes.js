const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  addProduct,
  getProductById
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.post('/', addProduct);
router.get('/:id', getProductById);

module.exports = router;
