const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

router.post('/add', protect, watchlistController.addToWatchlist);
router.delete('/remove', protect, watchlistController.removeFromWatchlist);
router.get('/', protect, watchlistController.getWatchlist);

module.exports = router;
