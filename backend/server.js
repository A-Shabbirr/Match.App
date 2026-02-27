// server.js
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

// Load environment variables at the very top
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Check if MONGO_URI exists
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1); // stop server
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Test root route
app.get("/", (req, res) => {
  res.send("Hello Adnan Shabbir, Backend is running");
});

// Routes
const tournamentRoutes = require("./routes/tournamentRoutes");
app.use("/tournaments", tournamentRoutes);

const userRoute = require("./routes/userRoute");
app.use("/users", userRoute);

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// Admin and dashboard routes (optional)
const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/dashboard", dashboardRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});