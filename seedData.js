// Shared sample product catalog + auto-seeding logic used both by the
// standalone seed script (npm run seed) and by the server's own startup
// auto-seed (so the in-memory database always has data with zero setup).
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const sampleProducts = [
  { name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 129.99, stock: 40, rating: 4.7, description: 'Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.', tags: ['audio', 'bluetooth', 'travel'], image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
  { name: 'Mechanical Keyboard RGB', category: 'Electronics', price: 89.5, stock: 25, rating: 4.5, description: 'Hot-swappable mechanical keyboard with per-key RGB lighting and tactile brown switches.', tags: ['keyboard', 'gaming', 'rgb'], image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500' },
  { name: '4K Ultra HD Monitor 27"', category: 'Electronics', price: 349.0, stock: 15, rating: 4.6, description: '27-inch 4K IPS monitor with HDR support and USB-C connectivity.', tags: ['monitor', '4k', 'display'], image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500' },
  { name: 'Smart Fitness Watch', category: 'Electronics', price: 199.99, stock: 30, rating: 4.4, description: 'Track heart rate, sleep, and workouts with a 7-day battery life smartwatch.', tags: ['wearable', 'fitness', 'smart'], image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },

  { name: "Men's Running Shoes", category: 'Apparel', price: 74.99, stock: 60, rating: 4.3, description: 'Lightweight breathable running shoes with responsive cushioning.', tags: ['shoes', 'running', 'sports'], image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
  { name: 'Classic Denim Jacket', category: 'Apparel', price: 59.0, stock: 45, rating: 4.2, description: 'Timeless denim jacket with a relaxed fit, perfect for any season.', tags: ['jacket', 'denim', 'casual'], image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500' },
  { name: 'Merino Wool Sweater', category: 'Apparel', price: 84.0, stock: 20, rating: 4.6, description: 'Soft, breathable merino wool sweater, ideal for layering in cold weather.', tags: ['sweater', 'wool', 'winter'], image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500' },

  { name: 'Stainless Steel Cookware Set', category: 'Home & Kitchen', price: 149.99, stock: 18, rating: 4.5, description: '10-piece stainless steel cookware set, oven-safe and dishwasher-safe.', tags: ['cookware', 'kitchen', 'steel'], image: 'https://images.unsplash.com/photo-1584990347449-a75c6a20c6c0?w=500' },
  { name: 'Espresso Machine', category: 'Home & Kitchen', price: 219.0, stock: 12, rating: 4.7, description: 'Semi-automatic espresso machine with built-in milk frother.', tags: ['coffee', 'espresso', 'kitchen'], image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500' },
  { name: 'Memory Foam Pillow (2-Pack)', category: 'Home & Kitchen', price: 39.99, stock: 50, rating: 4.4, description: 'Contoured memory foam pillows for neck and back support.', tags: ['pillow', 'bedding', 'sleep'], image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500' },

  { name: 'Yoga Mat Premium', category: 'Sports & Outdoors', price: 34.99, stock: 55, rating: 4.6, description: 'Extra-thick non-slip yoga mat with carrying strap.', tags: ['yoga', 'fitness', 'mat'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500' },
  { name: '2-Person Camping Tent', category: 'Sports & Outdoors', price: 99.0, stock: 22, rating: 4.3, description: 'Waterproof, easy-setup tent for weekend camping trips.', tags: ['camping', 'tent', 'outdoor'], image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500' },
  { name: 'Adjustable Dumbbell Set', category: 'Sports & Outdoors', price: 179.99, stock: 10, rating: 4.5, description: 'Space-saving adjustable dumbbells, 5-52.5 lbs per hand.', tags: ['gym', 'weights', 'fitness'], image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500' },

  { name: 'Bestselling Mystery Novel', category: 'Books', price: 14.99, stock: 100, rating: 4.8, description: 'A gripping page-turner that topped bestseller lists this year.', tags: ['book', 'mystery', 'fiction'], image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500' },
  { name: 'Learn to Code: Web Development', category: 'Books', price: 29.99, stock: 40, rating: 4.6, description: 'A beginner-friendly guide to HTML, CSS, and JavaScript.', tags: ['book', 'programming', 'education'], image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500' },
];

async function autoSeedIfEmpty() {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  Database already has ${count} products — skipping auto-seed.`);
    return;
  }

  console.log('🌱 No products found — auto-seeding sample catalog...');
  await Product.insertMany(sampleProducts);

  const adminEmail = 'admin@shopdemo.com';
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: 'Demo Admin',
      email: adminEmail,
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
    });
  }

  const customerEmail = 'customer@shopdemo.com';
  if (!(await User.findOne({ email: customerEmail }))) {
    await User.create({
      name: 'Demo Customer',
      email: customerEmail,
      password: await bcrypt.hash('customer123', 10),
      role: 'customer',
    });
  }

  console.log(`✅ Seeded ${sampleProducts.length} products, admin@shopdemo.com/admin123, customer@shopdemo.com/customer123`);
}

module.exports = { sampleProducts, autoSeedIfEmpty };
