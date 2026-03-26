const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  preferredFloor: {
    type: Number,
    min: 1
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'paid'
  },
  paymentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentReference: {
    type: String,
    trim: true
  },
  paymentOrderId: {
    type: String,
    trim: true
  },
  paymentSignature: {
    type: String,
    trim: true
  },
  paymentDate: {
    type: Date,
    default: null
  },
  plannedCheckInAt: {
    type: Date,
    default: null
  },
  plannedCheckOutAt: {
    type: Date,
    default: null
  },
  actualCheckInAt: {
    type: Date,
    default: null
  },
  actualCheckOutAt: {
    type: Date,
    default: null
  },
  earlyCheckoutReason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
