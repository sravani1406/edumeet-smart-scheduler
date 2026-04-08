const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");


const Availability = require("../models/Availability");

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendAppointmentEmail } = require("../utils/email");

// ------------------ ENSURE UPLOAD FOLDER EXISTS ------------------
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------ PHOTO UPLOAD SETUP ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  },
}).single("profileImage");


// ------------------ UPDATE TEACHER PHOTO ------------------
exports.updateTeacherPhoto = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profileImage = `/uploads/${req.file.filename}`;
      await user.save();

      res.json({
        success: true,
        message: "Profile photo updated",
        profileImage: user.profileImage,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

// ------------------ UPDATE TEACHER PASSWORD ------------------
exports.updateTeacherPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const availability = await Availability.findOne({
      teacher: req.user._id
    });

    if (!availability) {
      return res.json({ slots: {} });
    }

    res.json({ slots: availability.slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ------------------ GET TEACHER PROFILE ------------------
exports.getTeacherProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      success: true,
      teacher: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setAvailability = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { slots } = req.body;

    if (!Array.isArray(slots)) {
      return res.status(400).json({ message: "Slots must be an array" });
    }

    // 1️⃣ Convert array → object
    const structuredSlots = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    slots.forEach(({ day, start, end }) => {
      if (structuredSlots[day]) {
        structuredSlots[day].push({ start, end });
      }
    });

    // 2️⃣ Save into Availability collection
    let availability = await Availability.findOne({ teacher: teacherId });

    if (availability) {
      availability.slots = structuredSlots;
      await availability.save();
    } else {
      availability = await Availability.create({
        teacher: teacherId,
        slots: structuredSlots
      });
    }

    res.json({
      success: true,
      message: "Availability saved successfully",
      slots: availability.slots
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// ------------------ GET TEACHER APPOINTMENTS ------------------
exports.getTeacherAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      teacher: req.user._id
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error("Get teacher appointments error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ------------------ UPDATE APPOINTMENT STATUS ------------------
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      teacher: req.user._id,
    })
      .populate("student", "name email")
      .populate("teacher", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    // ================= SEND EMAIL TO STUDENT =================
    try {
      if (status === "confirmed") {
        await sendAppointmentEmail(
          appointment.student.email,
          appointment.teacher.email,
          {
            studentName: appointment.student.name,
            teacherName: appointment.teacher.name,
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            subject: appointment.subject,
          }
        );
        console.log("📧 Acceptance email sent to student");
      }

      if (status === "cancelled") {
        await sendAppointmentEmail(
          appointment.student.email,
          appointment.teacher.email,
          {
            studentName: appointment.student.name,
            teacherName: appointment.teacher.name,
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            subject: "Appointment Rejected",
          }
        );
        console.log("📧 Rejection email sent to student");
      }
    } catch (emailError) {
      console.error("❌ Student email failed:", emailError.message);
    }

    res.json({
      success: true,
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ message: error.message });
  }
};



// ------------------ ADD MEETING LINK ------------------
exports.addMeetingLink = async (req, res) => {
  try {
    const { meetingLink } = req.body;

    if (!meetingLink) {
      return res.status(400).json({ message: "Meeting link required" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      teacher: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.meetingLink = meetingLink;
    await appointment.save();

    res.json({
      success: true,
      message: "Meeting link added successfully",
      appointment
    });
  } catch (error) {
    console.error("Add meeting link error:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const studentId = req.user._id; // logged in student

    const bookings = await Appointment.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId)
        }
      },
      {
        $group: {
          _id: "$teacher",
          totalBookings: { $sum: 1 }
        }
      },
      {
        $sort: { totalBookings: -1 }
      },
      {
        $limit: 5   // ✅ MAX 5 TEACHERS
      }
    ]);

    if (bookings.length === 0) {
      return res.json([]);
    }

    const teacherIds = bookings.map(b => b._id);

    const teachers = await User.find({
      _id: { $in: teacherIds },
      role: "teacher"
    });

    // attach booking count
    const recommended = teachers.map(teacher => {
      const bookingData = bookings.find(
        b => b._id.toString() === teacher._id.toString()
      );

      return {
        ...teacher._doc,
        totalBookings: bookingData.totalBookings
      };
    });

    res.json(recommended);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
};