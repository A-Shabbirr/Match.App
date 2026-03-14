const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User"); 
const fs = require("fs");

// Storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "./uploads/profilePics";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // If req.user.id is undefined, fallback to timestamp
        const filename = (req.user?.id || "unknown") + "_" + Date.now() + path.extname(file.originalname);
        cb(null, filename);
    }
});

const upload = multer({ storage });

// Update user profile (bio + picture)
router.put("/users/:id", upload.single("profilePicture"), async (req, res) => {
    try {
        const { id } = req.params;
        const { bio } = req.body;

        console.log("=== Profile Update Request ===");
        console.log("Updating user:", id);
        console.log("Bio:", bio);
        console.log("File received:", req.file);

        const updateData = {};

        if (bio) updateData.bio = bio;

        if (req.file) {
            // Save the file URL/path
            updateData.profilePicture = `/uploads/profilePics/${req.file.filename}`;
            console.log("Profile picture path set to:", updateData.profilePicture);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        console.log("Updated user:", updatedUser);
        res.json(updatedUser);
    } catch (err) {
        console.error("Error in profile update:", err);
        res.status(500).json({ message: "Profile update failed" });
    }
});

module.exports = router;