const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');

dotenv.config({ quiet: true });

const importData = async () => {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');

  if (!adminEmail || adminPassword.length < 8 || adminPassword === 'password123') {
    console.error('Set ADMIN_EMAIL and a strong ADMIN_PASSWORD (8+ characters) in .env before seeding.');
    process.exit(1);
  }

  if (process.env.MONGO_DB_NAME?.trim() && process.env.MONGO_DB_NAME.trim() !== 'localstore_demo') {
    throw new Error('Demo seeding requires the localstore_demo database.');
  }
  await connectDB();

  const categoryData = [
    { name: 'Dairy & Breakfast', description: 'Milk, Bread, Butter, and more' },
    { name: 'Snacks & Munchies', description: 'Chips, Namkeen, Biscuits' },
    { name: 'Cold Drinks & Juices', description: 'Sodas, Fruit Juices, Energy Drinks' },
    { name: 'Atta, Rice & Dal', description: 'Staples for Indian Kitchen' },
    { name: 'Personal Care', description: 'Soap, Shampoo, Toothpaste' },
    { name: 'Vegetables & Fruits', description: 'Fresh Farm Produce' },
  ];

  const items = [
    { name: 'Amul Taaza Milk', cat: 0, w: '1 L', minP: 60, maxP: 75, img: '/images/products/milk.webp' },
    { name: 'Amul Gold Milk', cat: 0, w: '500 ml', minP: 30, maxP: 35, img: '/images/products/milk.webp' },
    { name: 'Mother Dairy Paneer', cat: 0, w: '200 g', minP: 80, maxP: 90, img: '/images/products/paneer.webp' },
    { name: 'Britannia White Bread', cat: 0, w: '400 g', minP: 40, maxP: 50, img: '/images/products/bread.webp' },
    { name: 'Amul Butter', cat: 0, w: '100 g', minP: 50, maxP: 60, img: '/images/products/butter.webp' },
    { name: 'Gowardhan Ghee', cat: 0, w: '1 L', minP: 500, maxP: 600, img: '/images/products/butter.webp' },
    { name: 'Epigamia Greek Yogurt', cat: 0, w: '90 g', minP: 40, maxP: 50, img: '/images/products/milk.webp' },
    { name: 'Eggs (Pack of 6)', cat: 0, w: '6 pcs', minP: 40, maxP: 60, img: '/images/products/eggs.webp' },

    { name: 'Lays India\'s Magic Masala', cat: 1, w: '50 g', minP: 20, maxP: 20, img: '/images/products/snacks.webp' },
    { name: 'Haldiram\'s Bhujia Sev', cat: 1, w: '400 g', minP: 100, maxP: 110, img: '/images/products/snacks.webp' },
    { name: 'Britannia Good Day', cat: 1, w: '250 g', minP: 30, maxP: 40, img: '/images/products/biscuits.webp' },
    { name: 'Parle-G Gold', cat: 1, w: '1 kg', minP: 80, maxP: 90, img: '/images/products/biscuits.webp' },
    { name: 'Maggi 2-Minute Noodles', cat: 1, w: '280 g', minP: 50, maxP: 60, img: '/images/products/noodles.webp' },
    { name: 'Kurkure Masala Munch', cat: 1, w: '90 g', minP: 20, maxP: 20, img: '/images/products/snacks.webp' },
    { name: 'Oreo Choco Creme', cat: 1, w: '120 g', minP: 30, maxP: 35, img: '/images/products/biscuits.webp' },

    { name: 'Coca Cola Soft Drink', cat: 2, w: '1.25 L', minP: 60, maxP: 70, img: '/images/products/coke.webp' },
    { name: 'Thums Up', cat: 2, w: '750 ml', minP: 40, maxP: 45, img: '/images/products/coke.webp' },
    { name: 'Real Mixed Fruit Juice', cat: 2, w: '1 L', minP: 110, maxP: 120, img: '/images/products/juice.webp' },
    { name: 'Red Bull Energy Drink', cat: 2, w: '250 ml', minP: 115, maxP: 125, img: '/images/products/coke.webp' },
    { name: 'Sprite Lemon Lime', cat: 2, w: '2 L', minP: 90, maxP: 100, img: '/images/products/coke.webp' },
    { name: 'Bisleri Mineral Water', cat: 2, w: '1 L', minP: 20, maxP: 20, img: '/images/products/water.webp' },

    { name: 'Aashirvaad Sharbati Atta', cat: 3, w: '5 kg', minP: 250, maxP: 280, img: '/images/products/atta.webp' },
    { name: 'India Gate Basmati Rice', cat: 3, w: '1 kg', minP: 120, maxP: 150, img: '/images/products/rice.webp' },
    { name: 'Tata Salt', cat: 3, w: '1 kg', minP: 25, maxP: 30, img: '/images/products/atta.webp' },
    { name: 'Fortune Sunflower Oil', cat: 3, w: '1 L', minP: 130, maxP: 150, img: '/images/products/oil.webp' },
    { name: 'Tata Sampann Toor Dal', cat: 3, w: '1 kg', minP: 160, maxP: 180, img: '/images/products/rice.webp' },
    { name: 'Madhur Sugar', cat: 3, w: '1 kg', minP: 50, maxP: 60, img: '/images/products/atta.webp' },
    { name: 'Everest Garam Masala', cat: 3, w: '100 g', minP: 70, maxP: 80, img: '/images/products/atta.webp' },

    { name: 'Dettol Original Soap', cat: 4, w: '125 g', minP: 35, maxP: 45, img: '/images/products/soap.webp' },
    { name: 'Colgate MaxFresh', cat: 4, w: '150 g', minP: 90, maxP: 100, img: '/images/products/soap.webp' },
    { name: 'Head & Shoulders Shampoo', cat: 4, w: '340 ml', minP: 280, maxP: 300, img: '/images/products/lotion.webp' },
    { name: 'Nivea Body Lotion', cat: 4, w: '400 ml', minP: 350, maxP: 400, img: '/images/products/lotion.webp' },
    { name: 'Parachute Coconut Oil', cat: 4, w: '250 ml', minP: 100, maxP: 110, img: '/images/products/oil.webp' },
    { name: 'Pepsodent Toothpaste', cat: 4, w: '150 g', minP: 80, maxP: 90, img: '/images/products/soap.webp' },

    { name: 'Fresh Onion', cat: 5, w: '1 kg', minP: 30, maxP: 50, img: '/images/products/onion.webp' },
    { name: 'Fresh Potato', cat: 5, w: '1 kg', minP: 20, maxP: 40, img: '/images/products/potato.webp' },
    { name: 'Hybrid Tomato', cat: 5, w: '1 kg', minP: 40, maxP: 80, img: '/images/products/tomato.webp' },
    { name: 'Robusta Banana', cat: 5, w: '1 kg', minP: 50, maxP: 70, img: '/images/products/banana.webp' },
    { name: 'Green Chilli', cat: 5, w: '100 g', minP: 10, maxP: 20, img: '/images/products/chilli.webp' },
    { name: 'Fresh Coriander', cat: 5, w: '1 bunch', minP: 10, maxP: 15, img: '/images/products/chilli.webp' },
    { name: 'Shimla Apple', cat: 5, w: '1 kg', minP: 150, maxP: 200, img: '/images/products/apple.webp' },
    { name: 'Kiran Watermelon', cat: 5, w: '1 pc', minP: 60, maxP: 90, img: '/images/products/watermelon.webp' },
  ];

  await User.db.transaction(async (session) => {
    for (const Model of [Order, Product, User, Category]) {
      if (await Model.exists({}).session(session)) {
        throw new Error('Demo seeding requires an empty database. Use a separate database for demo data.');
      }
    }

    await new User({
      name: 'Admin User',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    }).save({ session });

    const categories = await Category.insertMany(categoryData, { session });
    const indianProducts = items.map((item) => ({
      name: item.name,
      image: item.img,
      description: `Premium quality ${item.name} sourced fresh for your daily needs.`,
      category: categories[item.cat]._id,
      price: Math.floor(Math.random() * (item.maxP - item.minP + 1) + item.minP),
      stock: Math.floor(Math.random() * 50) + 10,
      weight: item.w,
    }));
    await Product.insertMany(indianProducts, { session });
  });
  console.log('Data imported. Sign in with ADMIN_EMAIL and ADMIN_PASSWORD from .env.');
  process.exit();
};

importData().catch((error) => {
  console.error(error.message.startsWith('Demo seeding requires')
    ? error.message
    : `Seeding failed (${error.code || error.name}). Check MongoDB configuration and connectivity.`);
  process.exit(1);
});
