require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/product.model');

const sampleProducts = [
  {
    name: 'Noise Cancelling Headphones',
    description: 'Premium wireless over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear acoustic isolation.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    stock: 25,
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'Tenkeyless RGB mechanical keyboard equipped with tactile blue switches, programmable macros, and aircraft-grade aluminum frame.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    stock: 15,
  },
  {
    name: 'Ultra-Slim Smartphone Gimbal',
    description: '3-axis handheld stabilizer for mobile cinematography with AI face tracking, gesture control, and foldable compact body.',
    price: 6499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    stock: 8,
  },
  {
    name: 'Classic Denim Trucker Jacket',
    description: 'Vintage wash rugged 100% organic cotton denim jacket with reinforced double stitching and brass shank buttons.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    stock: 30,
  },
  {
    name: 'Minimalist Oxford Sneakers',
    description: 'Breathable vegan leather low-top sneakers featuring memory foam insoles and vulcanized anti-slip rubber outsoles.',
    price: 1999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
    stock: 20,
  },
  {
    name: 'Structured Canvas Backpack',
    description: 'Water-resistant urban commuter backpack with padded 15.6-inch laptop compartment, hidden anti-theft pocket, and USB charging port.',
    price: 1799,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    stock: 12,
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'The definitive handbook by Martin Kleppmann on modern distributed systems, data modeling, reliability, and scalability.',
    price: 1450,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    stock: 50,
  },
  {
    name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    description: 'Legendary programming guide by Robert C. Martin outlining best engineering practices, refactoring rules, and readable architecture.',
    price: 999,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=800&auto=format&fit=crop&q=80',
    stock: 40,
  },
  {
    name: 'Acoustic Desk Lamp & Wireless Charger',
    description: 'Dimmable warm LED ambient desk lamp integrated with 15W Qi wireless fast-charging base and touch slider controls.',
    price: 1899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    stock: 18,
  },
  {
    name: 'Ergonomic Memory Foam Seat Cushion',
    description: 'Orthopedic contoured memory foam cushion designed for lumbar support and spinal alignment during extended workstation hours.',
    price: 1299,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
    stock: 22,
  },
];

const seedDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopkart';
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} products. Clearing existing catalogue...`);
      await Product.deleteMany({});
    }

    const created = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${created.length} products into ShopKart catalogue!`);
  } catch (err) {
    console.error('Error during seeding:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { sampleProducts, seedDB };
