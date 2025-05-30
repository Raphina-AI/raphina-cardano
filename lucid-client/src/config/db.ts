import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const mongodb = process.env.MONGODB
const connectDB = async () => {
    try {
        await mongoose.connect(mongodb!);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

export default connectDB;