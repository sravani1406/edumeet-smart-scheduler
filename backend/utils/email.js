const nodemailer = require('nodemailer');

// --------------------------------------------------
// CREATE TRANSPORTER
// --------------------------------------------------
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // ✅ OPTIONAL: Verify transporter (runs once per email send)
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter error:', error.message);
    } else {
      console.log('📧 Email transporter is ready');
    }
  });

  return transporter;
};

// --------------------------------------------------
// SEND APPROVAL EMAIL
// --------------------------------------------------
exports.sendApprovalEmail = async (email, name, role) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Account Approved - EduMeet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color:#4F46E5;">Welcome to EduMeet!</h2>
        <p>Hi ${name},</p>
        <p>Your ${role} account has been approved.</p>
        <p>You can now login and start using EduMeet.</p>
        <a href="${process.env.FRONTEND_URL}/login"
           style="display:inline-block;padding:10px 20px;
           background:#4F46E5;color:white;text-decoration:none;
           border-radius:5px;">Login Now</a>
        <p>— EduMeet Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Approval email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Approval email error:', error.message);
    throw error;
  }
};

// --------------------------------------------------
// SEND REJECTION EMAIL
// --------------------------------------------------
exports.sendRejectionEmail = async (email, name, role) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Registration Update - EduMeet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color:#DC2626;">Registration Update</h2>
        <p>Hi ${name},</p>
        <p>Your ${role} registration was not approved.</p>
        <p>Please contact the admin for more details.</p>
        <p>— EduMeet Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Rejection email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Rejection email error:', error.message);
  }
};

// --------------------------------------------------
// SEND APPOINTMENT EMAIL (STUDENT + TEACHER)
// --------------------------------------------------
exports.sendAppointmentEmail = async (
  studentEmail,
  teacherEmail,
  appointmentDetails
) => {
  console.log("📨 sendAppointmentEmail() function called");

  const transporter = createTransporter();

  const { teacherName, studentName, date, startTime, endTime, subject } =
    appointmentDetails;

  const formattedDate = new Date(date).toLocaleDateString();

  const studentMail = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: studentEmail,
    subject: 'Appointment Confirmed - EduMeet',
    html: `
      <p>Hello ${studentName},</p>
      <p>Your appointment is confirmed.</p>
      <p><b>Teacher:</b> ${teacherName}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Date:</b> ${formattedDate}</p>
      <p><b>Time:</b> ${startTime} - ${endTime}</p>
      <p>— EduMeet Team</p>
    `
  };

  const teacherMail = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: teacherEmail,
    subject: 'New Appointment Scheduled - EduMeet',
    html: `
      <p>Hello ${teacherName},</p>
      <p>You have a new appointment.</p>
      <p><b>Student:</b> ${studentName}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Date:</b> ${formattedDate}</p>
      <p><b>Time:</b> ${startTime} - ${endTime}</p>
      <p>— EduMeet Team</p>
    `
  };

  try {
    await transporter.sendMail(studentMail);
    await transporter.sendMail(teacherMail);
    console.log('📧 Appointment emails sent successfully to student & teacher');
    console.log("✅ Both appointment emails SENT");

  } catch (error) {
    console.error('❌ Appointment email error:', error.message);
  }
};
