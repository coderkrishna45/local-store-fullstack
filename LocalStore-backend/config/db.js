const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }

  const dbName = process.env.MONGO_DB_NAME?.trim() || 'localstore_demo';
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    dbName,
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`MongoDB connected to database: ${conn.connection.name}`);
};

module.exports = connectDB;
