const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const { updateProfile } = require('../controllers/authController');

// ------------------------------------------------------
// CHECK IF ADMIN EXISTS  ✅ REQUIRED FOR FRONTEND
// GET /api/auth/check-admin
// ------------------------------------------------------
router.get('/check-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin', status: 'approved' });
    res.json({ adminExists: !!adminExists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ------------------------------------------------------
// REGISTER
// POST /api/auth/register
// ------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, subject, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // 🚫 Only ONE admin allowed (CRITICAL FIX)
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(403).json({
          success: false,
          message: "Admin already exists. Admin registration is closed."
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      subject,
      phone,
      status: role === 'admin' ? 'approved' : 'pending'
    });

    res.status(201).json({
      success: true,
      message:
        role === "admin"
          ? "Admin account created"
          : "Registration successful. Wait for admin approval.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ------------------------------------------------------
// LOGIN
// POST /api/auth/login
// ------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (user.role !== "admin" && user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message:
          user.status === "pending"
            ? "Account pending approval"
            : "Account rejected"
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        subject: user.subject,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// ------------------------------------------------------
// GET USER PROFILE
// GET /api/auth/profile
// ------------------------------------------------------
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile"
    });
  }
});

// ------------------------------------------------------
// UPDATE USER PROFILE
// PUT /api/auth/profile
// ------------------------------------------------------
router.put('/profile', protect, async (req, res) => {
  try {
    await updateProfile(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
});

// ------------------------------------------------------
// UPDATE PASSWORD
// PUT /api/auth/update-password
// ------------------------------------------------------
router.put('/update-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password incorrect"
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update password"
    });
  }
});

module.exports = router;
