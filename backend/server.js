// server.js
require("dotenv").config();

const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1); // stop server
}
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  "http://localhost:3000",
  "https://match-app-j49n.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.get("/ping", (req, res) => {
  res.send("pong");
});
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


app.get("/health", (req, res) => res.json({ status: "ok" }));

// Admin and dashboard routes (optional)
const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/dashboard", dashboardRoutes);

app.use("/uploads", express.static("uploads"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  res.status(500).json({ message: err.message });
});