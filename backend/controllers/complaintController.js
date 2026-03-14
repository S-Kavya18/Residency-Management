const Complaint = require('../models/Complaint');
const ActivityLog = require('../models/ActivityLog');
const Staff = require('../models/Staff');
const User = require('../models/User');

const findLeastBusyStaff = async (department) => {
  const staffUsers = await User.find({
    role: 'staff',
    staffDepartment: department,
    isActive: true
  }).select('_id');

  if (!staffUsers.length) return null;

  const staffIds = staffUsers.map((s) => s._id);

  const workload = await Complaint.aggregate([
    {
      $match: {
        assignedTo: { $in: staffIds },
        status: { $in: ['pending', 'assigned', 'in-progress'] },
        isArchived: false
      }
    },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
  ]);

  const counts = new Map(workload.map((w) => [w._id.toString(), w.count]));

  let selected = staffUsers[0];
  let min = counts.get(selected._id.toString()) ?? 0;

  for (const staff of staffUsers) {
    const count = counts.get(staff._id.toString()) ?? 0;
    if (count < min) {
      min = count;
      selected = staff;
    }
  }

  return selected;
};

// Create complaint
exports.createComplaint = async (req, res) => {
  try {
    const { category, title, description, priority } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const staffMatch = await Staff.findOne({
      staffDepartment: category,
      isActive: true
    }).sort({ createdAt: 1 });

    const complaint = await Complaint.create({
      userId: req.user.userId,
      category,
      title,
      description,
      priority,
      image,
      assignedTo: staffMatch?._id
    });

    if (staffMatch) {
      complaint.status = 'assigned';
      await complaint.save();
    }

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'create',
      entityType: 'complaint',
      entityId: complaint._id,
      description: `Created complaint: ${title}`
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create emergency alert (resident quick action)
exports.createEmergencyAlert = async (req, res) => {
  try {
    const { description } = req.body || {};
    const user = await User.findById(req.user.userId).populate('roomId', 'roomNumber');

    const staffMatch = await findLeastBusyStaff('security');

    const message = description?.trim();
    const fallbackDescription = `Emergency reported${user?.roomId ? ` in room ${user.roomId.roomNumber}` : ''}`;

    const complaint = await Complaint.create({
      userId: req.user.userId,
      category: 'security',
      title: 'Emergency Alert',
      description: message || fallbackDescription,
      priority: 'urgent',
      assignedTo: staffMatch?._id,
      isEmergency: true
    });

    if (staffMatch) {
      complaint.status = 'assigned';
      await complaint.save();
    }

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'create',
      entityType: 'emergency',
      entityId: complaint._id,
      description: `Emergency alert raised${user?.roomId ? ` from room ${user.roomId.roomNumber}` : ''}`
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's complaints
exports.getMyComplaints = async (req, res) => {
  try {
    // Default to including history unless explicitly disabled.
    const includeHistory = req.query.includeHistory !== 'false';
    const filter = { userId: req.user.userId };
    if (!includeHistory) {
      filter.isArchived = false;
    }

    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all complaints (Admin)
exports.getAllComplaints = async (req, res) => {
  try {
    // Default to including history unless explicitly disabled.
    const includeHistory = req.query.includeHistory !== 'false';

    const { status, category, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (!includeHistory) filter.isArchived = false;

    const complaints = await Complaint.find(filter)
      .populate({
        path: 'userId',
        select: 'name email roomId',
        populate: { path: 'roomId', select: 'roomNumber' }
      })
      .populate('assignedTo', 'name email staffDepartment')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get assigned complaints (Staff)
exports.getAssignedComplaints = async (req, res) => {
  try {
    // Default to including history unless explicitly disabled.
    const includeHistory = req.query.includeHistory !== 'false';

    const filter = { assignedTo: req.user.userId };
    if (!includeHistory) {
      filter.isArchived = false;
    }

    const complaints = await Complaint.find(filter)
      .populate({
        path: 'userId',
        select: 'name email roomId',
        populate: { path: 'roomId', select: 'roomNumber' }
      })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign complaint to staff (Admin)
exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.assignedTo = staffId;
    complaint.status = 'assigned';
    await complaint.save();

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'assign',
      entityType: 'complaint',
      entityId: complaint._id,
      description: 'Complaint assigned to staff'
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update complaint status (Staff/Admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if staff member is assigned to this complaint
    if (req.user.role === 'staff' && complaint.assignedTo?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }

    complaint.status = status;
    if (status === 'resolved' || status === 'closed') {
      complaint.resolvedDate = new Date();
      complaint.resolutionNotes = resolutionNotes;
      complaint.isArchived = true;
      complaint.archivedAt = complaint.archivedAt || new Date();
    } else {
      complaint.isArchived = false;
      complaint.archivedAt = null;
    }
    await complaint.save();

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'update',
      entityType: 'complaint',
      entityId: complaint._id,
      description: `Updated complaint status to ${status}`
    });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
