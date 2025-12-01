/**
 * Database Configuration
 * Handles MongoDB connection setup
 * 
 * @author Juan Carlos Angulo
 * @module config/db
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @throws {Error} Exits process with code 1 if connection fails
 * 
 * @example
 * import connectDB from './config/db.js';
 * await connectDB();
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
