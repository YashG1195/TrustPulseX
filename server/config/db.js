const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustpulse';

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 2000, // short timeout to fail fast and fall back
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  };

  try {
    logger.info(`🔌 Attempting connection to MongoDB at: ${MONGODB_URI}`);
    const conn = await mongoose.connect(MONGODB_URI, options);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.warn(`⚠️ MONGODB_URI connection failed (${error.message}).`);
    logger.info('🚀 Spinning up in-memory MongoDB database server (mongodb-memory-server)...');
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      logger.info(`📡 In-Memory MongoDB running at: ${uri}`);
      
      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('✅ In-Memory MongoDB Connected Successfully.');
      return conn;
    } catch (memError) {
      logger.error(`❌ Failed to start and connect to in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('🔄 MongoDB reconnected successfully');
});

// Handle cleanup on exit
process.on('SIGINT', async () => {
  if (mongod) {
    await mongod.stop();
  }
  process.exit(0);
});

module.exports = connectDB;

