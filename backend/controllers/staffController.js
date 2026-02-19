const Complaint = require('../models/Complaint');
const HousekeepingRequest = require('../models/HousekeepingRequest');
const ActivityLog = require('../models/ActivityLog');

// Dashboard stats for staff
exports.getDashboardStats = async (req, res) => {
  try {
    const assignedComplaints = await Complaint.countDocuments({ 
      assignedTo: req.user.userId,
      status: { $in: ['assigned', 'in-progress'] }
    });

    const completedComplaints = await Complaint.countDocuments({ 
      assignedTo: req.user.userId,
      status: 'resolved'
    });

    const assignedTasks = await HousekeepingRequest.countDocuments({ 
      assignedTo: req.user.userId,
      status: { $in: ['assigned', 'in-progress'] }
    });

    const recentComplaints = await Complaint.find({ 
      assignedTo: req.user.userId 
    })
      .populate('userId', 'name email roomId')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      assignedComplaints,
      completedComplaints,
      assignedTasks,
      recentComplaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
