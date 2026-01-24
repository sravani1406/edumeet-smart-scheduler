const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

const {
  getAllTeachers,
  getTeacherById,
  getTeacherAvailability,
  bookAppointment,
  getStudentAppointments,
  cancelAppointment,
  getStudentStats,
  updateStudentPassword,
  getRecommendedTeachers
} = require("../controllers/studentController");

// Protect + Student Only
router.use(protect);
router.use(authorize("student"));

// ================= ROUTES =================

// Student stats
router.get("/stats", getStudentStats);

// Teacher browsing
router.get("/teachers", getAllTeachers);
router.get("/teachers/:id", getTeacherById);
router.get("/teachers/:id/availability", getTeacherAvailability);

// Appointments
router.get("/appointments", getStudentAppointments);
router.post("/appointments", bookAppointment);
router.put("/appointments/:id/cancel", cancelAppointment);

// Password update
router.put("/update-password", updateStudentPassword);

// ================= ML RECOMMENDATION =================
router.get("/recommend-teachers", getRecommendedTeachers);

module.exports = router;
