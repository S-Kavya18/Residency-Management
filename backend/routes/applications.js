const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getAllApplications,
  approveApplication,
  rejectApplication,
  deleteApplication
} = require('../controllers/applicationController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('resident'), createApplication);
router.get('/my', auth, authorize('resident'), getMyApplications);
router.get('/all', auth, authorize('admin'), getAllApplications);
router.put('/:id/approve', auth, authorize('admin'), approveApplication);
router.put('/:id/reject', auth, authorize('admin'), rejectApplication);
router.delete('/:id', auth, authorize('admin'), deleteApplication);

module.exports = router;
