const Analytics = require('../models/Analytics');
const Company = require('../models/Company');
const Review = require('../models/Review');

const getCompanyTrendData = async (companyId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const analytics = await Analytics.find({ company: companyId, date: { $gte: since }, period: 'daily' }).sort({ date: 1 });
  return analytics.length ? analytics : [];
};

const recomputeCompanyStats = async (companyId) => {
  if (!companyId) return null;

  const reviews = await Review.find({ company: companyId, isVisible: true });
  const reviewCount = reviews.length;
  const sumRatings = reviews.reduce(
    (acc, review) => {
      acc.overall += review.rating?.overall || 0;
      acc.workLifeBalance += review.rating?.workLifeBalance || 0;
      acc.salary += review.rating?.salary || 0;
      acc.careerGrowth += review.rating?.careerGrowth || 0;
      acc.management += review.rating?.management || 0;
      acc.culture += review.rating?.culture || 0;
      if (review.sentiment === 'positive') acc.positive += 1;
      if (review.sentiment === 'negative') acc.negative += 1;
      if (review.sentiment === 'neutral') acc.neutral += 1;
      if (review.isFake) acc.fake += 1;
      return acc;
    },
    { overall: 0, workLifeBalance: 0, salary: 0, careerGrowth: 0, management: 0, culture: 0, positive: 0, negative: 0, neutral: 0, fake: 0 }
  );

  const avgRating = reviewCount ? sumRatings.overall / reviewCount : 0;

  const trustScore = Math.round(Math.min(100, Math.max(0, avgRating * 20 + (sumRatings.positive - sumRatings.negative) * 2)));

  await Company.findByIdAndUpdate(companyId, {
    reviewCount,
    trustScore,
    sentimentScore: reviewCount ? (sumRatings.positive - sumRatings.negative) / reviewCount : 0,
    positiveSentimentPercent: reviewCount ? (sumRatings.positive / reviewCount) * 100 : 0,
    negativeSentimentPercent: reviewCount ? (sumRatings.negative / reviewCount) * 100 : 0,
    neutralSentimentPercent: reviewCount ? (sumRatings.neutral / reviewCount) * 100 : 0,
    fakeReviewPercent: reviewCount ? (sumRatings.fake / reviewCount) * 100 : 0,
    'ratings.overall': reviewCount ? sumRatings.overall / reviewCount : 0,
    'ratings.workLifeBalance': reviewCount ? sumRatings.workLifeBalance / reviewCount : 0,
    'ratings.salary': reviewCount ? sumRatings.salary / reviewCount : 0,
    'ratings.careerGrowth': reviewCount ? sumRatings.careerGrowth / reviewCount : 0,
    'ratings.management': reviewCount ? sumRatings.management / reviewCount : 0,
    'ratings.culture': reviewCount ? sumRatings.culture / reviewCount : 0,
  }, { new: true });
};

const getPlatformStats = async () => {
  const companyCount = await Company.countDocuments({});
  const reviewCount = await Review.countDocuments({ isVisible: true });
  const avgTrustScoreDoc = await Company.aggregate([
    { $match: { trustScore: { $gt: 0 } } },
    { $group: { _id: null, avgTrustScore: { $avg: '$trustScore' } } },
  ]);
  const avgTrustScore = avgTrustScoreDoc[0]?.avgTrustScore || 0;

  return {
    totalCompanies: companyCount,
    totalReviews: reviewCount,
    averageTrustScore: parseFloat(avgTrustScore.toFixed(1)),
  };
};

module.exports = {
  getCompanyTrendData,
  recomputeCompanyStats,
  getPlatformStats,
};
