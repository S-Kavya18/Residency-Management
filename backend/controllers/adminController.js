const User = require('../models/User');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const Application = require('../models/Application');
const Complaint = require('../models/Complaint');
const HousekeepingRequest = require('../models/HousekeepingRequest');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcryptjs');

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalResidents = await User.countDocuments({ role: 'resident', isActive: true });
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });
    const availableRooms = await Room.countDocuments({ status: 'available' });
    
    const occupancyRate = totalRooms > 0 
      ? ((occupiedRooms / totalRooms) * 100).toFixed(2) 
      : 0;

    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const activeComplaints = await Complaint.countDocuments({ 
      status: { $in: ['pending', 'assigned', 'in-progress'] } 
    });

    const recentApplications = await Application.find({ status: 'pending' })
      .populate('userId', 'name email')
      .populate('roomId', 'roomNumber roomType')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentComplaints = await Complaint.find({ 
      status: { $in: ['pending', 'assigned'] } 
    })
      .populate('userId', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalResidents,
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate,
      pendingApplications,
      activeComplaints,
      recentApplications,
      recentComplaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.staffDepartment = department;

    const users = await User.find(filter)
      .select('-password')
      .populate('roomId')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all staff
exports.getStaff = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = {};
    
    if (department) {
      filter.staffDepartment = department;
    }

    const staff = await Staff.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get occupancy report
exports.getOccupancyReport = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate({
        path: 'currentOccupancy',
        select: 'name email'
      })
      .sort({ floor: 1, roomNumber: 1 });

    const report = rooms.map(room => ({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      floor: room.floor,
      capacity: room.capacity,
      currentOccupancy: room.currentOccupancy,
      occupancyRate: ((room.currentOccupancy / room.capacity) * 100).toFixed(2),
      status: room.status,
      isAvailable: room.isAvailable
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get complaint statistics
exports.getComplaintStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const byStatus = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const byCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const byPriority = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(2) : 0;

    res.json({
      total,
      byStatus,
      byCategory,
      byPriority,
      resolved,
      resolutionRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin checkout
exports.checkoutRoom = async (req, res) => {
  try {
    const { roomId, userId, reason } = req.body;
    let user = null;

    if (userId) {
      user = await User.findById(userId);
    } else if (roomId) {
      user = await User.findOne({ roomId });
    }

    if (!user || !user.roomId) {
      return res.status(404).json({ message: 'No active room allocation found for checkout' });
    }

    const room = await Room.findById(user.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

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
    if (room.status !== 'maintenance') {
      if (room.currentOccupancy <= 0) {
        room.status = 'available';
        room.isAvailable = true;
      } else {
        room.status = 'occupied';
        room.isAvailable = false;
      }
    } else {
      room.isAvailable = false;
    }
    await room.save();

    user.roomId = null;
    user.checkOutAt = now;
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
      description: `Admin checkout for room ${room.roomNumber}${reason ? ` (reason: ${reason})` : ''}`
    });

    res.json({ message: 'Checkout completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer report
exports.getCustomerReport = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'resident', isActive: true });

    const frequentCustomers = await Application.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$userId', totalVisits: { $sum: 1 } } },
      { $sort: { totalVisits: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          totalVisits: 1
        }
      }
    ]);

    res.json({
      totalCustomers,
      frequentCustomers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create staff (Admin)
// Create staff (Admin)
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, address, staffDepartment } = req.body;

    if (!name || !email || !password || !staffDepartment) {
      return res.status(400).json({ message: 'Name, email, password, and department are required' });
    }

    // Check if staff with this email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create staff record
    const staff = await Staff.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      staffDepartment,
      isActive: true
    });

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'create',
      entityType: 'staff',
      entityId: staff._id,
      description: `Created staff ${staff.name}`
    });

    res.status(201).json({
      id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      address: staff.address,
      staffDepartment: staff.staffDepartment,
      isActive: staff.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update staff (Admin)
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, staffDepartment, isActive, password } = req.body;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    if (email && email !== staff.email) {
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    if (name !== undefined) staff.name = name;
    if (email !== undefined) staff.email = email;
    if (phone !== undefined) staff.phone = phone;
    if (address !== undefined) staff.address = address;
    if (staffDepartment !== undefined) staff.staffDepartment = staffDepartment;
    if (typeof isActive === 'boolean') staff.isActive = isActive;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      staff.password = await bcrypt.hash(password, salt);
    }

    await staff.save();

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'update',
      entityType: 'staff',
      entityId: staff._id,
      description: `Updated staff ${staff.name}`
    });

    res.json({
      id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      address: staff.address,
      staffDepartment: staff.staffDepartment,
      isActive: staff.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete staff (Admin)
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Clear assignments in Complaint
    await Complaint.updateMany(
      { assignedTo: staff._id },
      { $set: { assignedTo: null, status: 'pending' } }
    );

    // Clear assignments in HousekeepingRequest
    await HousekeepingRequest.updateMany(
      { assignedTo: staff._id },
      { $set: { assignedTo: null, status: 'pending' } }
    );

    // Delete the staff record
    await Staff.findByIdAndDelete(staff._id);

    await ActivityLog.create({
      userId: req.user.userId,
      action: 'delete',
      entityType: 'staff',
      entityId: staff._id,
      description: `Deleted staff ${staff.name}`
    });

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
