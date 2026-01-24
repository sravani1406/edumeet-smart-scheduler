const User = require("../models/User")
const bcrypt = require("bcryptjs")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// ------------------ MULTER SETUP FOR PROFILE PHOTOS ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public/uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname
    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("profileImage")

// ------------------ GET PROFILE (All Roles) ------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ success: true, data: user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Error fetching profile" })
  }
}

exports.uploadProfileImage = async (req, res) => {
  try {
    // Wrap multer in Promise to avoid double response
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Delete old profile image
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, "../public", user.profileImage)
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath)
    }

    user.profileImage = `/uploads/${req.file.filename}`
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      profileImage: user.profileImage,
    })

  } catch (err) {
    console.error("Upload failed:", err)
    return res.status(400).json({
      success: false,
      message: err.message || "Upload failed",
    })
  }
}

// ------------------ CHANGE PASSWORD (All Roles) ------------------
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Both old and new passwords are required" })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" })
  }

  try {
    const user = await User.findById(req.user._id).select("+password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify old password
    const isMatch = await user.matchPassword(oldPassword)

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" })
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Error updating password" })
  }
}
