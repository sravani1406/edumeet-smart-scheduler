const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  slots: {
    Monday: [{
      start: String,
      end: String
    }],
    Tuesday: [{
      start: String,
      end: String
    }],
    Wednesday: [{
      start: String,
      end: String
    }],
    Thursday: [{
      start: String,
      end: String
    }],
    Friday: [{
      start: String,
      end: String
    }],
    Saturday: [{
      start: String,
      end: String
    }],
    Sunday: [{
      start: String,
      end: String
    }]
  }
}, {
  timestamps: true
});

availabilitySchema.index({ teacher: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);