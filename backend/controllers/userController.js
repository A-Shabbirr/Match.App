// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==================== REGISTER USER ====================
exports.registerUser = async (req, res) => {
    if (!req.body) return res.status(400).json({ message: "Request body missing" });

    const { name, email, password, phone, header, role } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "Name, email, and password are required" });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            header,
            role: role || "user"
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==================== LOGIN USER ====================
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==================== GET USER BY ID ====================
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            "name header email role profilePicture bio"
        );
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        console.error("Error in getUserById:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ==================== GET ALL USERS ====================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: error.message });
    }
};

// ==================== UPDATE PROFILE ====================
exports.updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("PUT /users/:id called for user:", id);
        console.log("Request body:", req.body);
        console.log("File uploaded:", req.file);

        const updateData = {};
        if (req.body.bio) updateData.bio = req.body.bio;
        if (req.file) updateData.profilePicture = req.file.path; // Cloudinary URL

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        console.log("Profile updated successfully:", updatedUser);
        res.json(updatedUser);
    } catch (err) {
        console.error("Profile update failed:", err);
        res.status(500).json({ message: "Profile update failed" });
    }
};