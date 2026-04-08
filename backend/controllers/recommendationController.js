const axios = require("axios");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

exports.getRecommendations = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const appointments = await Appointment
  .find({ student: studentId })
  .populate("teacher");

    const teachers = await User.find({ role: "teacher" });

    // FIXED: using subject instead of specialization
    const formattedAppointments = appointments.map(a => ({
      studentId: a.student.toString(),
      specialization: a.teacher?.subject || "General"
    }));

    // FIXED: using subject instead of specialization
    const formattedTeachers = teachers.map(t => ({
      _id: t._id.toString(),

      name: t.name,
      specialization: t.subject || "General",
      averageRating: 4
    }));

    const response = await axios.post(
      "http://localhost:8000/recommend",
      {
        studentId,
        appointments: formattedAppointments,
        teachers: formattedTeachers
      }
    );

    res.json(response.data);

  } catch (error) {
  console.log("FULL ERROR:", error.response?.data || error.message);
  res.status(500).json({
    message: "Recommendation error",
    error: error.response?.data || error.message
  });
}

};