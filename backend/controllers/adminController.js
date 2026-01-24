const User = require('../models/User');
const Appointment = require('../models/Appointment');
const {
  sendApprovalEmail,
  sendRejectionEmail
} = require('../utils/email');

// ----------------------------------------
// GET ALL PENDING USERS
// ----------------------------------------
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      status: 'pending',
      role: { $ne: 'admin' }
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(pendingUsers);
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ message: 'Error fetching pending users' });
  }
};

// ----------------------------------------
// APPROVE USER
// ----------------------------------------
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'approved';
    await user.save();

    // ✅ Send structured approval email
    await sendApprovalEmail(user.email, user.name, user.role);

    res.json({
      message: 'User approved successfully',
      user
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Error approving user' });
  }
};

// ----------------------------------------
// REJECT USER
// ----------------------------------------
const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'rejected';
    await user.save();

    // ✅ Send structured rejection email
    await sendRejectionEmail(user.email, user.name, user.role);

    res.json({ message: 'User rejected successfully' });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ message: 'Error rejecting user' });
  }
};

// ----------------------------------------
// GET ALL TEACHERS
// ----------------------------------------
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: 'teacher',
      status: 'approved'
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Error fetching teachers' });
  }
};

// ----------------------------------------
// GET ALL STUDENTS
// ----------------------------------------
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      status: 'approved'
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
};

// ----------------------------------------
// DELETE USER
// ----------------------------------------
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove related appointments
    if (user.role === 'teacher') {
      await Appointment.deleteMany({ teacher: user._id });
    } else if (user.role === 'student') {
      await Appointment.deleteMany({ student: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// ----------------------------------------
// GET ALL APPOINTMENTS
// ----------------------------------------
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('student', 'name email')
      .populate('teacher', 'name email department')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

// ----------------------------------------
// GET DASHBOARD STATS
// ----------------------------------------
const getDashboardStats = async (req, res) => {
  try {
    const totalTeachers = await User.countDocuments({
      role: 'teacher',
      status: 'approved'
    });

    const totalStudents = await User.countDocuments({
      role: 'student',
      status: 'approved'
    });

    const pendingApprovals = await User.countDocuments({
      status: 'pending',
      role: { $ne: 'admin' }
    });

    const totalAppointments = await Appointment.countDocuments();

    const upcomingAppointments = await Appointment.countDocuments({
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    });

    res.json({
      totalTeachers,
      totalStudents,
      pendingApprovals,
      totalAppointments,
      upcomingAppointments
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};

// ----------------------------------------
module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllTeachers,
  getAllStudents,
  deleteUser,
  getAllAppointments,
  getDashboardStats
};
