const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const mongoose = require("mongoose");
const { sendEmail, sendAppointmentEmail } = require("../utils/email");

// ================= GET ALL APPROVED TEACHERS =================
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: "teacher",
      status: "approved",
    }).select("-password");

    res.json(teachers);
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ message: "Error fetching teachers" });
  }
};

// ================= GET TEACHER BY ID =================
const getTeacherById = async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: "teacher",
      status: "approved",
    }).select("-password");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (error) {
    console.error("Get teacher error:", error);
    res.status(500).json({ message: "Error fetching teacher details" });
  }
};

// ================= GET TEACHER AVAILABILITY =================
const getTeacherAvailability = async (req, res) => {
  try {
    const availability = await Availability.findOne({
      teacher: req.params.id,
    });

    if (!availability) {
      return res.json({ slots: {} });
    }

    res.json(availability);
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({ message: "Error fetching availability" });
  }
};

// ================= BOOK APPOINTMENT =================
const bookAppointment = async (req, res) => {
  try {
    const { teacher, date, startTime, endTime, subject, description } = req.body;

    const teacherUser = await User.findOne({
      _id: teacher,
      role: "teacher",
      status: "approved",
    });

    if (!teacherUser) {
      return res.status(404).json({
        message: "Teacher not found or not approved",
      });
    }

    const existingAppointment = await Appointment.findOne({
      teacher,
      date: new Date(date),
      startTime,
      endTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "This time slot is already booked",
      });
    }

    const appointment = await Appointment.create({
      student: req.user._id,
      teacher,
      date: new Date(date),
      startTime,
      endTime,
      subject,
      description,
      status: "pending",
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("student", "name email")
      .populate("teacher", "name email");

    try {
      await sendAppointmentEmail(
        populatedAppointment.student.email,
        populatedAppointment.teacher.email,
        {
          studentName: populatedAppointment.student.name,
          teacherName: populatedAppointment.teacher.name,
          date: populatedAppointment.date,
          startTime: populatedAppointment.startTime,
          endTime: populatedAppointment.endTime,
          subject: populatedAppointment.subject,
        }
      );
    } catch (emailError) {
      console.error("Appointment email failed:", emailError.message);
    }

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ message: "Error booking appointment" });
  }
};

// ================= GET STUDENT APPOINTMENTS =================
const getStudentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      student: req.user._id,
    })
      .populate("teacher", "name email department designation phone")
      .sort({ date: -1 });

    res.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

// ================= CANCEL APPOINTMENT =================
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      student: req.user._id,
    }).populate("teacher", "name email");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      return res
        .status(400)
        .json({ message: "Cannot cancel this appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    try {
      await sendEmail({
        to: appointment.teacher.email,
        subject: "Appointment Cancelled",
        text: "The appointment has been cancelled.",
      });
    } catch (emailError) {
      console.error("Cancel email error:", emailError.message);
    }

    res.json(appointment);
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Error cancelling appointment" });
  }
};

// ================= STUDENT STATS =================
const getStudentStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalAppointments = await Appointment.countDocuments({
      student: req.user._id,
    });

    const upcomingAppointments = await Appointment.countDocuments({
      student: req.user._id,
      date: { $gte: today },
      status: { $in: ["pending", "confirmed"] },
    });

    const completedAppointments = await Appointment.countDocuments({
      student: req.user._id,
      status: "completed",
    });

    res.json({
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
    });
  } catch (error) {
    console.error("Get student stats error:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
};

// ================= UPDATE STUDENT PASSWORD =================
const updateStudentPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    const student = await User.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Error updating password" });
  }
};

// ================= ML TEACHER RECOMMENDATION =================


const getRecommendedTeachers = async (req, res) => {
  try {
    const studentId = req.user._id.toString();
    const subject = req.query.subject;
    console.log("Requested subject:", subject);
    let mlResponse = null;

    // 1️⃣ Call ML service
    try {
      mlResponse = await axios.post(
        "http://127.0.0.1:5001/recommend-teachers",
        {
          student_id: studentId,
          subject: subject,
        }
      );
    } catch (mlError) {
      console.warn("ML service failed, falling back");
    }

    const rawMlTeachers = mlResponse?.data?.recommended_teachers || [];
    const source = mlResponse?.data?.source || "ml";

    // 2️⃣ Validate ObjectIds
    const mlTeachers = rawMlTeachers.filter(id =>
      mongoose.Types.ObjectId.isValid(id)
    );

    // 3️⃣ ML-based result
    if (mlTeachers.length > 0) {
      console.log("Using ML recommendations");
      const teachers = await User.find({
        _id: { $in: mlTeachers },
        role: "teacher",
        status: "approved",
      }).select("-password");

      return res.json({
        source: "ml",
        recommendedTeachers: teachers,
      });
    }

    // 4️⃣ Rule-based fallback
    console.log("FALLING BACK TO RULE BASED");
    const fallbackTeachers = await User.find({
      role: "teacher",
      status: "approved",
      subject: {
    $regex: `(^|,)\\s*${subject}\\s*(,|$)`,
    $options: "i",
  },
    }).select("-password");
    console.log("Rule-based teachers count:", fallbackTeachers.length);
    return res.json({
      source: "rule-based",
      recommendedTeachers: fallbackTeachers,
    });

  } catch (error) {
    console.error("Hybrid recommendation error:", error);
    return res.status(500).json({ message: "Recommendation failed" });
  }
};


module.exports = {
  getAllTeachers,
  getTeacherById,
  getTeacherAvailability,
  bookAppointment,
  getStudentAppointments,
  cancelAppointment,
  getStudentStats,
  updateStudentPassword,
  getRecommendedTeachers,
};
