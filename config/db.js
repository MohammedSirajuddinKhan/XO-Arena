const mongoose = require("mongoose");

let isConnecting = false;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. Database features will be unavailable until it is configured.");
    return;
  }

  if (isConnecting || mongoose.connection.readyState === 1) return;
  isConnecting = true;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.error("The server will keep running and retry the database connection shortly.");
    setTimeout(connectDB, 10000).unref();
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Retrying connection...");
  setTimeout(connectDB, 5000).unref();
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

module.exports = connectDB;
