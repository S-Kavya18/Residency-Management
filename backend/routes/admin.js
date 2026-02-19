const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getStaff,
  getOccupancyReport,
  getComplaintStats,
  getCustomerReport,
  checkoutRoom,
  createStaff,
  updateStaff,
  deleteStaff
} = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

router.get('/dashboard', auth, authorize('admin'), getDashboardStats);
router.get('/users', auth, authorize('admin'), getAllUsers);
router.get('/staff', auth, authorize('admin'), getStaff);
router.post('/staff', auth, authorize('admin'), createStaff);
router.put('/staff/:id', auth, authorize('admin'), updateStaff);
router.delete('/staff/:id', auth, authorize('admin'), deleteStaff);
router.get('/reports/occupancy', auth, authorize('admin'), getOccupancyReport);
router.get('/reports/complaints', auth, authorize('admin'), getComplaintStats);
router.get('/reports/customers', auth, authorize('admin'), getCustomerReport);
router.post('/checkout', auth, authorize('admin'), checkoutRoom);

module.exports = router;
