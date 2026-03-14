const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authmiddleware");
const { updateUserProfile, getUserById, getAllUsers } = require("../controllers/userController");
const parser = require("../middleware/multerCloudinary");

// routes/userRoute.js
router.get("/test", (req, res) => {
    try {
        res.status(200).json({ message: "User route working!" });
    } catch (err) {
        console.error("Error in /test:", err);
        res.status(500).json({ message: "Server error" });
    }
});
router.put("/:id", verifyToken, parser.single("profilePicture"), updateUserProfile);

// Protected routes
router.get("/", verifyToken, getAllUsers);      // all users
router.get("/:id", verifyToken, getUserById);  // single user

module.exports = router;