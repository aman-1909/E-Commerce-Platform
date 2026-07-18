const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Stripe is only initialized if a real key is provided. Otherwise we run in
// "mock payment" mode, which simulates a successful charge instantly — this
// keeps the whole checkout flow demoable without requiring a Stripe account.
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// POST /api/orders/checkout  { shippingAddress }
// Creates a Stripe PaymentIntent (or mock) and the resulting Order.
router.post('/checkout', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Validate stock before charging
    for (const item of cart.items) {
      if (!item.product || item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product ? item.product.name : 'a product'}.`,
        });
      }
    }

    const total = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const amountInCents = Math.round(total * 100);

    let paymentIntentId = null;
    let clientSecret = null;
    let mockMode = true;

    if (stripe) {
      mockMode = false;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: { userId: String(req.user._id) },
      });
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
    } else {
      paymentIntentId = `mock_pi_${Date.now()}`;
    }

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((i) => ({
        product: i.product._id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        category: i.product.category,
      })),
      total,
      status: mockMode ? 'paid' : 'pending',
      paymentIntentId,
      shippingAddress: req.body.shippingAddress || {},
    });

    // Decrement stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    // Update user's category affinity for recommendations
    const categories = [...new Set(cart.items.map((i) => i.product.category))];
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { purchasedCategories: { $each: categories } },
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      order,
      mockMode,
      clientSecret, // only present in real Stripe mode; frontend uses this to confirm payment
      message: mockMode
        ? 'Order placed successfully (mock payment mode — add a Stripe test key to .env for real test payments).'
        : 'Order created — confirm payment on the client using the client secret.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Checkout failed.', error: err.message });
  }
});

// POST /api/orders/confirm  { orderId } - marks an order paid after Stripe confirms client-side
router.post('/confirm', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.status = 'paid';
    await order.save();
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to confirm order.', error: err.message });
  }
});

// GET /api/orders - current user's order history
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.', error: err.message });
  }
});

module.exports = router;
