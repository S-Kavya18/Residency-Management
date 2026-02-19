const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/staffController');
const { auth, authorize } = require('../middleware/auth');

router.get('/dashboard', auth, authorize('staff'), getDashboardStats);

module.exports = router;
