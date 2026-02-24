const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors")

//database
dotenv.config();
connectDB();

//middleware
app.use(express.json());
app.use(cors())


// Test root route
app.get("/", (req, res) => {
    res.send("Hello Adnan Shabbir, Backend is running");
});

// Routes
const tournamentRoutes = require("./routes/tournamentRoutes");
app.use("/api/tournaments", tournamentRoutes);

const userRoute = require("./routes/userRoute");
app.use("/api/users", userRoute);

const authRoutes = require("./routes/authRoutes"); // ✅ import auth
app.use("/api/auth", authRoutes); // ✅ register & login routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
