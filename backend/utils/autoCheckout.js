const User = require('../models/User');
const Application = require('../models/Application');
const Room = require('../models/Room');
const ActivityLog = require('../models/ActivityLog');

// Run every minute so residents are checked out quickly after planned time passes
const CHECK_INTERVAL_MS = 60 * 1000;

const syncRoomAvailability = (room) => {
  if (room.status === 'maintenance') {
    room.isAvailable = false;
    return;
  }

  if (room.currentOccupancy <= 0) {
    room.currentOccupancy = 0;
    room.status = 'available';
    room.isAvailable = true;
  } else {
    room.status = 'occupied';
    room.isAvailable = false;
  }
};

const autoCheckoutResident = async (user, application, now) => {
  if (!user.roomId) return;

  const room = await Room.findById(user.roomId);
  if (!room) return;

  room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
  syncRoomAvailability(room);
  await room.save();

  user.roomId = null;
  user.checkOutAt = now;
  await user.save();

  application.actualCheckOutAt = now;
  await application.save();

  await ActivityLog.create({
    userId: user._id,
    action: 'auto-checkout',
    entityType: 'room',
    entityId: room._id,
    description: `Auto checkout after planned date for room ${room.roomNumber}`
  });
};

const runAutoCheckout = async () => {
  const now = new Date();

  try {
    const users = await User.find({ roomId: { $ne: null }, isActive: true });

    for (const user of users) {
      const application = await Application.findOne({
        userId: user._id,
        status: 'approved',
        plannedCheckOutAt: { $ne: null, $lte: now },
        actualCheckOutAt: null
      }).sort({ reviewedDate: -1, createdAt: -1 });

      if (!application) continue;

      await autoCheckoutResident(user, application, now);
    }
  } catch (error) {
    console.error('Auto-checkout job failed:', error.message);
  }
};

let intervalId = null;

const scheduleAutoCheckout = () => {
  if (intervalId) return intervalId;
  runAutoCheckout();
  intervalId = setInterval(runAutoCheckout, CHECK_INTERVAL_MS);
  return intervalId;
};

module.exports = { scheduleAutoCheckout, runAutoCheckout };
