const express = require('express');
const router = express.Router();
const {
  getMenu,
  getSubscription,
  updateSubscription,
  submitFeedback
} = require('../controllers/foodController');
const { auth, authorize } = require('../middleware/auth');

router.get('/menu', getMenu);
router.get('/subscription', auth, authorize('resident'), getSubscription);
router.put('/subscription', auth, authorize('resident'), updateSubscription);
router.post('/feedback', auth, authorize('resident'), submitFeedback);

module.exports = router;
