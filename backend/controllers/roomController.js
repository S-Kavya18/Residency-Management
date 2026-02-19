const Room = require('../models/Room');
const Application = require('../models/Application');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

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

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { status, roomType, floor, available } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (roomType) filter.roomType = roomType;
    if (floor) filter.floor = parseInt(floor);
    if (available === 'true') {
      filter.isAvailable = true;
      filter.status = 'available';
    }

    const rooms = await Room.find(filter).sort({ floor: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single room
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create room (Admin only)
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    
    await ActivityLog.create({
      userId: req.user.userId,
      action: 'create',
      entityType: 'room',
      entityId: room._id,
      description: `Created room ${room.roomNumber}`
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update room (Admin only)
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'update',
      entityType: 'room',
      entityId: room._id,
      description: `Updated room ${room.roomNumber}`
    });

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete room (Admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room has occupants
    if (room.currentOccupancy > 0) {
      return res.status(400).json({ message: 'Cannot delete room with occupants' });
    }

    await Room.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'delete',
      entityType: 'room',
      entityId: room._id,
      description: `Deleted room ${room.roomNumber}`
    });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available rooms
exports.getAvailableRooms = async (req, res) => {
  try {
    const { roomType, floor, acType } = req.query;
    const filter = {
      isAvailable: true,
      status: 'available',
      $expr: { $lt: ['$currentOccupancy', '$capacity'] }
    };

    if (roomType) filter.roomType = roomType;
    if (floor) filter.floor = parseInt(floor);
    if (acType === 'ac') {
      filter.amenities = { $in: ['AC'] };
    }
    if (acType === 'nonac') {
      filter.$or = [
        { amenities: { $exists: false } },
        { amenities: { $size: 0 } },
        { amenities: { $nin: ['AC'] } }
      ];
    }

    const rooms = await Room.find(filter).sort({ floor: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Checkout room (Resident)
exports.checkoutRoom = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.roomId) {
      return res.status(400).json({ message: 'No room allocated to checkout' });
    }

    const room = await Room.findById(user.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const { reason } = req.body || {};
    const now = new Date();
    const latestApplication = await Application.findOne({
      userId: user._id,
      status: 'approved'
    }).sort({ reviewedDate: -1, createdAt: -1 });

    if (latestApplication?.plannedCheckOutAt && now < latestApplication.plannedCheckOutAt) {
      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: 'Early checkout requires a reason' });
      }
    }

    room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
    syncRoomAvailability(room);
    await room.save();

    user.roomId = null;
    user.checkOutAt = new Date();
    await user.save();

    if (latestApplication) {
      latestApplication.actualCheckOutAt = now;
      if (reason && reason.trim()) {
        latestApplication.earlyCheckoutReason = reason.trim();
      }
      await latestApplication.save();
    }

    await Complaint.updateMany(
      { userId: user._id, isArchived: false },
      { $set: { isArchived: true, archivedAt: now } }
    );

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'checkout',
      entityType: 'room',
      entityId: room._id,
      description: `Checked out from room ${room.roomNumber}${reason ? ` (reason: ${reason})` : ''}`
    });

    res.json({ message: 'Checkout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
