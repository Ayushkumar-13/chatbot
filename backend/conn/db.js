import mongoose from "mongoose";

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 8000;

export const connectDB = async () => {
    mongoose.connection.on('connected', () =>
        console.log("-----------------MongoDb Connected---------------------------")
    );

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                family: 4,
                serverSelectionTimeoutMS: 10000,
            });
            return;
        } catch (error) {
            if (attempt < MAX_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            } else {
                console.log("Could not connect to MongoDB. Please resume your Atlas cluster.");
            }
        }
    }
};