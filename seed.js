// Manually (re-)seed the sample product catalog.
// Useful mainly if you're using an external/persistent MongoDB (set MONGO_URI
// in .env) and want to reset it to the sample catalog.
//
// If you're using the default in-memory MongoDB, you don't need this script:
// the server auto-seeds itself on every startup since in-memory data doesn't
// persist between runs anyway.
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { sampleProducts } = require('./seedData');

async function seed() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('⚠️  No MONGO_URI set in .env.');
    console.log('   This script is only useful with a persistent external MongoDB.');
    console.log('   The in-memory database (default mode) auto-seeds itself on every');
    console.log('   `npm start` — just run the server, no separate seed step needed.');
    process.exit(0);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected. Seeding...');

  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`Inserted ${sampleProducts.length} products.`);

  const adminEmail = 'admin@shopdemo.com';
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: 'Demo Admin',
      email: adminEmail,
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
    });
    console.log(`Created admin user -> ${adminEmail} / admin123`);
  }

  const customerEmail = 'customer@shopdemo.com';
  if (!(await User.findOne({ email: customerEmail }))) {
    await User.create({
      name: 'Demo Customer',
      email: customerEmail,
      password: await bcrypt.hash('customer123', 10),
      role: 'customer',
    });
    console.log(`Created customer user -> ${customerEmail} / customer123`);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
