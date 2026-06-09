const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:companySlug', reviewController.getReviews);
router.post('/:id/helpful', protect, reviewController.markHelpful);
router.post('/:id/report', protect, reviewController.reportReview);

module.exports = router;
