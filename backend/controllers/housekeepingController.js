const HousekeepingRequest = require('../models/HousekeepingRequest');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Create request
exports.createRequest = async (req, res) => {
  try {
    const { serviceType, preferredDate, preferredTime } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user.roomId) {
      return res.status(400).json({ message: 'No room allocated. Cannot request housekeeping service' });
    }

    const request = await HousekeepingRequest.create({
      userId,
      roomId: user.roomId,
      serviceType,
      preferredDate,
      preferredTime
    });

    await ActivityLog.create({
      userId,
      action: 'create',
      entityType: 'housekeeping',
      entityId: request._id,
      description: `Created housekeeping request: ${serviceType}`
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await HousekeepingRequest.find({ userId: req.user.userId })
      .populate('roomId')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all requests (Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await HousekeepingRequest.find(filter)
      .populate('userId', 'name email')
      .populate('roomId')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assigned requests (Staff)
exports.getAssignedRequests = async (req, res) => {
  try {
    const includeHistory = req.query.includeHistory !== 'false';
    const filter = { assignedTo: req.user.userId };
    if (!includeHistory) {
      filter.status = { $nin: ['completed', 'cancelled'] };
    }

    const requests = await HousekeepingRequest.find(filter)
      .populate('userId', 'name email')
      .populate('roomId')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update request status (Staff/Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, assignedTo } = req.body;

    const request = await HousekeepingRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    if (assignedTo) {
      request.assignedTo = assignedTo;
    }
    if (notes) request.notes = notes;
    if (status === 'completed') {
      request.completedDate = new Date();
    }
    await request.save();

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'update',
      entityType: 'housekeeping',
      entityId: request._id,
      description: `Updated housekeeping request status to ${status}`
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
