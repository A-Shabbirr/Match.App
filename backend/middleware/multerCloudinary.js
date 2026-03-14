const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profilePics", // folder in Cloudinary
        format: async (req, file) => "png", // or keep original
        public_id: (req, file) => `${req.user?.id || "user"}_${Date.now()}`,
    },
});

const parser = multer({ storage });

module.exports = parser;