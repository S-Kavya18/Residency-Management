const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  checkoutRoom
} = require('../controllers/roomController');
const { auth, authorize } = require('../middleware/auth');

router.get('/available', getAvailableRooms);
router.get('/', getAllRooms);
router.get('/:id', getRoom);
router.post('/', auth, authorize('admin'), createRoom);
router.put('/:id', auth, authorize('admin'), updateRoom);
router.delete('/:id', auth, authorize('admin'), deleteRoom);
router.post('/checkout', auth, authorize('resident'), checkoutRoom);

module.exports = router;
