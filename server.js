require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const recommendationRoutes = require('./routes/recommendations');
const { autoSeedIfEmpty } = require('./seedData');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: process.env.MONGO_URI ? 'external-mongo' : 'in-memory-mongo' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      // No external MongoDB configured — spin up an in-memory instance so the
      // project runs with zero setup. Data resets when the server restarts;
      // run `npm run seed` after starting to populate sample products.
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('🧠 Using in-memory MongoDB (no external database required).');
      console.log('   Data will reset when the server stops.');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    await autoSeedIfEmpty();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
