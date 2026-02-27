import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("Database connection successful!");
  } catch (error) {
    console.log("Error connecting to the database:", error);
    process.exit(1);
  }
};
