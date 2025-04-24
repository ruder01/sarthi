const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if MongoDB URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database...");
  } catch (error) {
    console.log("Error: ", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;