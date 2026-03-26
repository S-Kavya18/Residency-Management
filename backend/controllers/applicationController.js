const Application = require('../models/Application');
const Room = require('../models/Room');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Create application
exports.createApplication = async (req, res) => {
  try {
    const { roomId, preferredFloor, roomType, plannedCheckInAt, plannedCheckOutAt } = req.body;
    const userId = req.user.userId;

    const existingApplication = await Application.findOne({ userId, status: 'pending' });
    if (existingApplication) {
      return res.status(400).json({ message: 'You already have a pending application' });
    }

    const user = await User.findById(userId);
    if (user.roomId) {
      return res.status(400).json({ message: 'You already have a room allocated' });
    }

    const room = await Room.findById(roomId);
    if (!room || !room.isRoomAvailable()) {
      return res.status(400).json({ message: 'Room is not available' });
    }

    if (plannedCheckInAt && plannedCheckOutAt) {
      const checkIn = new Date(plannedCheckInAt);
      const checkOut = new Date(plannedCheckOutAt);
      if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
        return res.status(400).json({ message: 'Invalid check-in or check-out date' });
      }
      if (checkOut <= checkIn) {
        return res.status(400).json({ message: 'Check-out must be after check-in' });
      }
    }

    const application = await Application.create({
      userId,
      roomId,
      preferredFloor,
      roomType,
      paymentAmount: room.rent,
      paymentStatus: 'paid',
      paymentReference: 'payment-disabled',
      plannedCheckInAt: plannedCheckInAt || null,
      plannedCheckOutAt: plannedCheckOutAt || null
    });

    await ActivityLog.create({
      userId,
      action: 'create',
      entityType: 'application',
      entityId: application._id,
      description: 'Room application created'
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.userId })
      .populate('roomId')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all applications (Admin)
exports.getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('userId', 'name email phone')
      .populate('roomId')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve application (Admin)
exports.approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const application = await Application.findById(id)
      .populate('roomId')
      .populate('userId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application already processed' });
    }

    const room = application.roomId;
    if (!room.isRoomAvailable()) {
      return res.status(400).json({ message: 'Room is no longer available' });
    }

    application.status = 'approved';
    application.reviewedDate = new Date();
    application.reviewedBy = req.user.userId;
    application.remarks = remarks;
    application.actualCheckInAt = new Date();
    await application.save();

    room.currentOccupancy = Math.min(room.currentOccupancy + 1, room.capacity);
    room.isAvailable = false;
    room.status = 'occupied';
    await room.save();

    const user = application.userId;
    user.roomId = room._id;
    user.checkInAt = new Date();
    user.checkOutAt = null;
    await user.save();

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'approve',
      entityType: 'application',
      entityId: application._id,
      description: `Approved application for room ${room.roomNumber}`
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject application (Admin)
exports.rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const application = await Application.findById(id).populate('roomId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application already processed' });
    }

    application.status = 'rejected';
    application.reviewedDate = new Date();
    application.reviewedBy = req.user.userId;
    application.remarks = remarks;
    await application.save();

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'reject',
      entityType: 'application',
      entityId: application._id,
      description: 'Rejected room application'
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete application (Admin)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'name')
      .populate('roomId', 'roomNumber');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await Application.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'delete',
      entityType: 'application',
      entityId: application._id,
      description: `Deleted application for ${application.userId?.name || 'user'} (room ${application.roomId?.roomNumber || 'N/A'})`
    });

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
