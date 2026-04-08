const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendAppointmentEmail } = require('../utils/email');

router.use(protect);

// =============================
// BOOK APPOINTMENT
// =============================
router.post('/book', async (req, res) => {
  try {
    const { teacherId, date, startTime, endTime, subject } = req.body;

    const student = await User.findById(req.user._id);
    const teacher = await User.findById(teacherId);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher' });
    }

    // 🔴 DUPLICATE CHECK
    const existingAppointment = await Appointment.findOne({
      teacher: teacher._id,
      date: new Date(date),
      startTime,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: "This time slot is already booked. Please select another time."
      });
    }

    const appointment = await Appointment.create({
      student: student._id,
      teacher: teacher._id,
      date,
      startTime,
      endTime,
      subject,
      status: 'pending'
    });

    await sendAppointmentEmail(
      student.email,
      teacher.email,
      {
        studentName: student.name,
        teacherName: teacher.name,
        date,
        startTime,
        endTime,
        subject
      }
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to book appointment' });
  }
});

// =============================
// GET BOOKED SLOTS (NEW)
// =============================
router.get('/booked-slots', async (req, res) => {
  try {
    const { teacherId, date } = req.query;

    if (!teacherId || !date) {
      return res.status(400).json({ message: 'Teacher ID and date required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      teacher: teacherId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'pending'] }
    }).select('startTime');

    res.json({
      bookedSlots: appointments
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booked slots' });
  }
});

module.exports = router;