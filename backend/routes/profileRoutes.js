const express = require("express")
const router = express.Router()
const { protect } = require("../middleware/auth")

const { getProfile, uploadProfileImage, changePassword } = require("../controllers/profileController")

// All routes require authentication
router.use(protect)

// Profile routes (accessible by all authenticated users)
router.get("/", getProfile)
router.post("/upload-image", uploadProfileImage)
router.put("/change-password", changePassword)

module.exports = router
