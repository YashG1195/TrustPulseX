const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/favorites/:companyId', protect, userController.toggleFavorite);
router.get('/watchlist', protect, userController.getWatchlist);
router.post('/watchlist/:companyId', protect, userController.toggleWatchlist);
router.get('/notifications', protect, userController.getNotifications);
router.put('/notifications/read', protect, userController.markNotificationsRead);

module.exports = router;
