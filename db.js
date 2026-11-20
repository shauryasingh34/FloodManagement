import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/floodwatch';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}
