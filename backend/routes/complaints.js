const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getAssignedComplaints,
  assignComplaint,
  updateComplaintStatus
} = require('../controllers/complaintController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, authorize('resident'), upload.single('image'), createComplaint);
router.get('/my', auth, authorize('resident'), getMyComplaints);
router.get('/all', auth, authorize('admin'), getAllComplaints);
router.get('/assigned', auth, authorize('staff'), getAssignedComplaints);
router.put('/:id/assign', auth, authorize('admin'), assignComplaint);
router.put('/:id/status', auth, authorize('staff', 'admin'), updateComplaintStatus);

module.exports = router;
