const Complaint = require('../models/Complaint');
const ActivityLog = require('../models/ActivityLog');
const Staff = require('../models/Staff');
const User = require('../models/User');
const Application = require('../models/Application');

const archiveComplaintsForUser = async (userId, archivedAt) => {
  await Complaint.updateMany(
    { userId, isArchived: false },
    { $set: { isArchived: true, archivedAt: archivedAt || new Date() } }
  );
};

const getCheckedOutUserIds = async () => {
  const [checkedOutUsers, appCheckedOutUsers] = await Promise.all([
    User.find({ checkOutAt: { $ne: null } }).select('_id'),
    Application.distinct('userId', { actualCheckOutAt: { $ne: null } })
  ]);

  return Array.from(
    new Set([
      ...checkedOutUsers.map((user) => user._id.toString()),
      ...appCheckedOutUsers.map((id) => id.toString())
    ])
  );
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

// Get user's complaints
exports.getMyComplaints = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('checkOutAt');
    if (user?.checkOutAt) {
      await archiveComplaintsForUser(user._id, user.checkOutAt);
    } else {
      const appCheckout = await Application.findOne({
        userId: req.user.userId,
        actualCheckOutAt: { $ne: null }
      }).select('actualCheckOutAt');
      if (appCheckout?.actualCheckOutAt) {
        await archiveComplaintsForUser(req.user.userId, appCheckout.actualCheckOutAt);
      }
    }

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
    if (includeHistory) {
      const checkedOutUserIds = await getCheckedOutUserIds();
      if (checkedOutUserIds.length) {
        await Complaint.updateMany(
          { userId: { $in: checkedOutUserIds }, isArchived: false },
          { $set: { isArchived: true, archivedAt: new Date() } }
        );
      }
    }

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
    if (includeHistory) {
      const checkedOutUserIds = await getCheckedOutUserIds();
      if (checkedOutUserIds.length) {
        await Complaint.updateMany(
          { userId: { $in: checkedOutUserIds }, isArchived: false },
          { $set: { isArchived: true, archivedAt: new Date() } }
        );
      }
    }

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
