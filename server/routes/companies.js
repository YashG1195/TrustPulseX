const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect } = require('../middleware/auth');

router.get('/search', companyController.searchCompanies);
router.get('/trending', companyController.getTrending);
router.get('/top-rated', companyController.getTopRated);
router.get('/lowest-rated', companyController.getLowestRated);
router.get('/compare', companyController.compareCompanies);
router.post('/compare', companyController.compareCompanies);
router.get('/recommendations', companyController.getRecommendations);
router.get('/:slug/analytics', companyController.getCompanyAnalytics);
router.get('/:slug/insights', companyController.getAIInsights);
router.post('/chatbot', companyController.chatbot);
router.get('/:slug', companyController.getCompany);

module.exports = router;
