const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getAssignedRequests,
  updateRequestStatus
} = require('../controllers/housekeepingController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('resident'), createRequest);
router.get('/my', auth, authorize('resident'), getMyRequests);
router.get('/all', auth, authorize('admin'), getAllRequests);
router.get('/assigned', auth, authorize('staff'), getAssignedRequests);
router.put('/:id/status', auth, authorize('staff', 'admin'), updateRequestStatus);

module.exports = router;
