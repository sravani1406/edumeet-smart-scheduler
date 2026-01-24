const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

const {
  getTeacherProfile,
  updateTeacherPhoto,
  updateTeacherPassword,
  getAvailability,
  setAvailability,
  getTeacherAppointments,
  updateAppointmentStatus,
  addMeetingLink           // 👈 ADD THIS
} = require("../controllers/teacherController");



// --------------------- PROFILE ROUTES ---------------------
router.get(
  "/profile",
  protect,
  authorize("teacher"),
  getTeacherProfile
);

router.put(
  "/profile/photo",
  protect,
  authorize("teacher"),
  updateTeacherPhoto
);

router.put(
  "/profile/password",
  protect,
  authorize("teacher"),
  updateTeacherPassword
);

// --------------------- AVAILABILITY ROUTES ---------------------
router.get(
  "/availability",
  protect,
  authorize("teacher"),
  getAvailability
);

router.post(
  "/availability",
  protect,
  authorize("teacher"),
  setAvailability
);

// --------------------- APPOINTMENTS ROUTE (FIXED) ---------------------
router.get(
  "/appointments",
  protect,
  authorize("teacher"),
  getTeacherAppointments
);


// --------------------- UPDATE APPOINTMENT STATUS ---------------------
router.put(
  "/appointments/:id",
  protect,
  authorize("teacher"),
  updateAppointmentStatus
);


router.put(
  "/appointments/:id/meeting-link",
  protect,
  authorize("teacher"),
  addMeetingLink
);

module.exports = router;
