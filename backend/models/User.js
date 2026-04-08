const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const availabilitySchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },

    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },

    department: {
      type: String,
      default: ''
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },

    ratingBreakdown: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 }
    },

    subject: {
      type: String,
      default: ''
    },

    bio: {
      type: String,
      maxlength: 500
    },

    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
    },

    profileImage: {
      type: String,
      default: ''
    },

    // ✅ AVAILABILITY (IMPORTANT FIX)
    availability: {
      Monday: [availabilitySchema],
      Tuesday: [availabilitySchema],
      Wednesday: [availabilitySchema],
      Thursday: [availabilitySchema],
      Friday: [availabilitySchema],
      Saturday: [availabilitySchema],
      Sunday: [availabilitySchema]
    },
    /* ======================================================
       🔐 ADDED FOR FORGOT PASSWORD (SAFE ADDITION)
       ====================================================== */

    resetPasswordToken: {
      type: String,
      default: undefined
    },

    resetPasswordExpire: {
      type: Date,
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

/* 🔐 Encrypt password before save */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* 🔑 Match password */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* ✅ Auto-approve admins */
userSchema.pre('save', function (next) {
  if (this.role === 'admin') {
    this.status = 'approved';
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
