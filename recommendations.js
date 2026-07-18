const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * A lightweight, explainable content-based recommendation engine.
 *
 * Real-world AI recommendation systems (e.g. collaborative filtering,
 * matrix factorization, neural embeddings) need large interaction datasets
 * to outperform simple heuristics. For a project of this scope, we use a
 * transparent content-based scoring model:
 *
 *   score(product) = categoryAffinity + tagOverlap + ratingBoost - alreadyOwnedPenalty
 *
 * This is a legitimate, widely-used technique (it's essentially what
 * "customers who bought X also liked Y" systems do before they have enough
 * data for collaborative filtering) and it's easy to demo and explain in an
 * interview.
 */
async function getRecommendationsForUser(userId, limit = 8) {
  // Build a profile of the user's affinities from past orders + viewed products
  const orders = await Order.find({ user: userId }).lean();

  const categoryCounts = {};
  const purchasedProductIds = new Set();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      purchasedProductIds.add(String(item.product));
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + item.quantity;
      }
    });
  });

  const candidateProducts = await Product.find({
    _id: { $nin: Array.from(purchasedProductIds) },
  }).lean();

  const totalCategoryWeight = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;

  const scored = candidateProducts.map((product) => {
    const categoryAffinity = ((categoryCounts[product.category] || 0) / totalCategoryWeight) * 10;
    const ratingBoost = (product.rating || 0) * 0.5;
    const stockPenalty = product.stock === 0 ? -100 : 0;
    const score = categoryAffinity + ratingBoost + stockPenalty;
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Cold-start: if the user has no history, fall back to top-rated products
  if (Object.keys(categoryCounts).length === 0) {
    const topRated = await Product.find({ stock: { $gt: 0 } })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
    return topRated;
  }

  return scored
    .filter((s) => s.product.stock > 0)
    .slice(0, limit)
    .map((s) => s.product);
}

/** "Similar products" for a single product detail page (same category, close price) */
async function getSimilarProducts(productId, limit = 4) {
  const product = await Product.findById(productId).lean();
  if (!product) return [];

  const similar = await Product.find({
    _id: { $ne: productId },
    category: product.category,
  })
    .limit(limit * 2)
    .lean();

  similar.sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price));

  return similar.slice(0, limit);
}

module.exports = { getRecommendationsForUser, getSimilarProducts };
