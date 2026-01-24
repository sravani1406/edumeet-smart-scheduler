const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllTeachers,
  getAllStudents,
  deleteUser,
  getAllAppointments,
  getDashboardStats
} = require('../controllers/adminController');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Pending users management
router.get('/pending-users', getPendingUsers);
router.put('/approve-user/:id', approveUser);
router.put('/reject-user/:id', rejectUser);

// Teachers management
router.get('/teachers', getAllTeachers);

// Students management
router.get('/students', getAllStudents);

// User deletion
router.delete('/users/:id', deleteUser);

// Appointments
router.get('/appointments', getAllAppointments);

module.exports = router;