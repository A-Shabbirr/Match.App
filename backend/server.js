require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not defined in .env");
  process.exit(1);
}

connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://match-app-j49n.vercel.app"
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// Health check
app.get("/ping", (req, res) => res.send("pong"));
app.get("/", (req, res) => res.send("Backend running"));
app.get("/health", (req, res) => res.json({ status: "ok" }));

const matchesRoutes = require("./routes/matchesRoute");
app.use("/", matchesRoutes);

const tournamentRoutes = require("./routes/tournamentRoutes");
app.use("/tournaments", tournamentRoutes);

const userRoutes = require("./routes/userRoute");
app.use("/users", userRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// Optional admin/dashboard
const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/dashboard", dashboardRoutes);

// Static uploads
app.use("/uploads", express.static("uploads"));

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);
  res.status(500).json({ message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));