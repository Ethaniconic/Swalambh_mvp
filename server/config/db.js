import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI?.trim();
console.log('[DB] MONGO_URI loaded:', MONGO_URI ? '✓ SET (' + MONGO_URI.substring(0, 30) + '...)' : '✗ NOT SET');

if (!MONGO_URI) {
  throw new Error('MONGODB_URI is not set. Add it to .env or the environment.');
}

const MONGO_DB = process.env.MONGODB_DB || 'dermsight';
console.log('[DB] MONGO_DB:', MONGO_DB);

export const connectDB = async () => {
  try {
    console.log('[DB] Attempting to connect with URI starting:', MONGO_URI.substring(0, 50) + '...');
    await mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('[DB] Full error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection failed:', error.message);
  }
};

export const db = mongoose.connection;
