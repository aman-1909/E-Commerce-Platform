const express = require('express');
const Product = require('../models/Product');
const { getSimilarProducts } = require('../utils/recommendations');

const router = express.Router();

// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);

    switch (sort) {
      case 'price_asc':
        query = query.sort({ price: 1 });
        break;
      case 'price_desc':
        query = query.sort({ price: -1 });
        break;
      case 'rating':
        query = query.sort({ rating: -1 });
        break;
      default:
        query = query.sort({ createdAt: -1 });
    }

    const products = await query.lean();
    res.json({ products, count: products.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products.', error: err.message });
  }
});

// GET /api/products/categories - distinct category list for filter UI
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories.', error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const similar = await getSimilarProducts(req.params.id, 4);
    res.json({ product, similar });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product.', error: err.message });
  }
});

module.exports = router;
