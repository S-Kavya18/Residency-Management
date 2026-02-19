const FoodSubscription = require('../models/FoodSubscription');
const ActivityLog = require('../models/ActivityLog');

// Get menu (placeholder - can be extended)
exports.getMenu = async (req, res) => {
  try {
    // This can be extended to a Menu model
    const menu = {
      breakfast: ['Idli', 'Dosa', 'Poha', 'Paratha', 'Bread & Butter'],
      lunch: ['Rice', 'Dal', 'Vegetable Curry', 'Roti', 'Salad'],
      dinner: ['Rice', 'Dal', 'Vegetable Curry', 'Roti', 'Dessert']
    };
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subscription status
exports.getSubscription = async (req, res) => {
  try {
    let subscription = await FoodSubscription.findOne({ userId: req.user.userId });
    
    if (!subscription) {
      subscription = await FoodSubscription.create({
        userId: req.user.userId,
        isSubscribed: false
      });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subscribe/Unsubscribe
exports.updateSubscription = async (req, res) => {
  try {
    const { isSubscribed, mealPlan } = req.body;

    let subscription = await FoodSubscription.findOne({ userId: req.user.userId });

    if (!subscription) {
      subscription = await FoodSubscription.create({
        userId: req.user.userId,
        isSubscribed,
        mealPlan: mealPlan || 'all',
        startDate: isSubscribed ? new Date() : null
      });
    } else {
      subscription.isSubscribed = isSubscribed;
      if (mealPlan) subscription.mealPlan = mealPlan;
      if (isSubscribed && !subscription.startDate) {
        subscription.startDate = new Date();
      }
      if (!isSubscribed) {
        subscription.endDate = new Date();
      }
      await subscription.save();
    }

    await ActivityLog.create({
      userId: req.user.userId,
      action: isSubscribed ? 'subscribe' : 'unsubscribe',
      entityType: 'food',
      entityId: subscription._id,
      description: `Food subscription ${isSubscribed ? 'activated' : 'deactivated'}`
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    let subscription = await FoodSubscription.findOne({ userId: req.user.userId });

    if (!subscription) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    subscription.feedback.push({
      rating,
      comment
    });
    await subscription.save();

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'feedback',
      entityType: 'food',
      entityId: subscription._id,
      description: 'Food feedback submitted'
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
