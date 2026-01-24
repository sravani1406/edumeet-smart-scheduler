const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendAppointmentEmail } = require('../utils/email');

router.use(protect);

// Book appointment
router.post('/book', async (req, res) => {
  try {
    const { teacherId, date, startTime, endTime, subject } = req.body;

    const student = await User.findById(req.user._id);
    const teacher = await User.findById(teacherId);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher' });
    }

    const appointment = await Appointment.create({
      student: student._id,
      teacher: teacher._id,
      date,
      startTime,
      endTime,
      subject,
      status: 'confirmed'
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

module.exports = router;
