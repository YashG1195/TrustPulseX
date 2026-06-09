const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getDashboardStats);
router.get('/charts/:companySlug', dashboardController.getChartData);
router.get('/industry', dashboardController.getIndustryAnalytics);

module.exports = router;
