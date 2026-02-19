const mongoose = require('mongoose');

const foodSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  mealPlan: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'all'],
    default: 'all'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  feedback: [{
    date: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('FoodSubscription', foodSubscriptionSchema);
