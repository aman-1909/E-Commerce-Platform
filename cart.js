const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// GET /api/cart - current user's cart with product details populated
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart.', error: err.message });
  }
});

// POST /api/cart/add  { productId, quantity }
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find((i) => String(i.product) === String(productId));
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate('items.product');
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to cart.', error: err.message });
  }
});

// PUT /api/cart/update  { productId, quantity }
router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    const item = cart.items.find((i) => String(i.product) === String(productId));
    if (!item) return res.status(404).json({ message: 'Item not in cart.' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    await cart.populate('items.product');
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart.', error: err.message });
  }
});

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    cart.items = cart.items.filter((i) => String(i.product) !== String(req.params.productId));
    await cart.save();
    await cart.populate('items.product');
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item.', error: err.message });
  }
});

module.exports = router;
