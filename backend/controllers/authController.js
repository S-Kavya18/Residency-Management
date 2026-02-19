const User = require('../models/User');
const Staff = require('../models/Staff');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'your_secret_key', {
    expiresIn: '30d'
  });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'resident',
      phone,
      address
    });

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      action: 'register',
      entityType: 'user',
      entityId: user._id,
      description: 'User registered'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // First, try to find user in User table (residents/admins)
    let user = await User.findOne({ email });
    let userRole = 'resident';

    // If not found in User table, check Staff table
    if (!user) {
      user = await Staff.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      userRole = 'staff';
    } else {
      userRole = user.role;
    }

    // Check password
    let isMatch;
    if (userRole === 'staff') {
      // For staff, use bcrypt directly
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // For users (residents/admins), use the model method
      isMatch = await user.comparePassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user/staff is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      action: 'login',
      entityType: userRole === 'staff' ? 'staff' : 'user',
      entityId: user._id,
      description: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} logged in`,
      ipAddress: req.ip
    });

    const token = generateToken(user._id, userRole);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        roomId: user.roomId,
        staffDepartment: user.staffDepartment
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    let user;
    
    // Try to find in User table first
    user = await User.findById(req.user.userId).select('-password').populate('roomId');
    
    // If not found, check Staff table
    if (!user) {
      user = await Staff.findById(req.user.userId).select('-password');
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
