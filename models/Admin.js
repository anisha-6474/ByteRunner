const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['superAdmin', 'moderator', 'contentManager'],
    default: 'moderator'
  },
  permissions: {
    manageUsers: { type: Boolean, default: false },
    manageCodingProblems: { type: Boolean, default: false },
    manageCodeExecutionSettings: { type: Boolean, default: false },
    viewAnalytics: { type: Boolean, default: false },
    manageContests: { type: Boolean, default: false },
    manageFeedback: { type: Boolean, default: false }
  },
  lastLogin: Date,
  loginHistory: [{
    timestamp: Date,
    ip: String,
    userAgent: String
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

adminSchema.pre('save', async function(next) {
  // Hash the password only if it's new or modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


adminSchema.methods.updatePassword = async function(newPassword) {
  this.password = await bcrypt.hash(newPassword, 10);
  return await this.save();
};

module.exports = mongoose.model('Admin', adminSchema);
