const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad'],
    required: true
  },
  floor: {
    type: Number,
    required: true,
    min: 1
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  amenities: [{
    type: String
  }],
  rent: {
    type: Number,
    required: true,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Check if room is available
roomSchema.methods.isRoomAvailable = function() {
  return this.isAvailable && this.status === 'available' && this.currentOccupancy < this.capacity;
};

module.exports = mongoose.model('Room', roomSchema);
