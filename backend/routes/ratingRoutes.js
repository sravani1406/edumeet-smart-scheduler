const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Rating = require('../models/Rating');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

router.use(protect);

// Submit rating
router.post('/', async (req, res) => {
  try {
    const { appointmentId, rating, review } = req.body;

    // 1️⃣ Check appointment exists
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 2️⃣ Check student owns appointment
    if (appointment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // 3️⃣ Check appointment completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        message: 'You can only rate after appointment completion'
      });
    }
    // 3.5️⃣ Check 48-hour rating window
        const appointmentDateTime = new Date(
        `${appointment.date.toISOString().split('T')[0]}T${appointment.endTime}`
        );

        const now = new Date();

        const diffInHours = (now - appointmentDateTime) / (1000 * 60 * 60);

        if (diffInHours > 48) {
        return res.status(400).json({
            message: 'Rating window expired (48 hours limit)'
        });
        }
    // 4️⃣ Prevent duplicate rating
    const existingRating = await Rating.findOne({ appointment: appointmentId });

    if (existingRating) {
      return res.status(400).json({
        message: 'You have already rated this appointment'
      });
    }

    // 5️⃣ Create rating
    const newRating = await Rating.create({
      student: req.user._id,
      teacher: appointment.teacher,
      appointment: appointmentId,
      rating,
      review
    });

    // 6️⃣ Update teacher average
    const teacher = await User.findById(appointment.teacher);

    const updatedTotal = teacher.totalRatings + 1;
    const updatedAverage =
      (teacher.averageRating * teacher.totalRatings + rating) /
      updatedTotal;

    teacher.totalRatings = updatedTotal;
    teacher.averageRating = updatedAverage;
    // Update rating breakdown
        switch (rating) {
        case 5:
            teacher.ratingBreakdown.five += 1;
            break;
        case 4:
            teacher.ratingBreakdown.four += 1;
            break;
        case 3:
            teacher.ratingBreakdown.three += 1;
            break;
        case 2:
            teacher.ratingBreakdown.two += 1;
            break;
        case 1:
            teacher.ratingBreakdown.one += 1;
            break;
        }
    await teacher.save();

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});

module.exports = router;