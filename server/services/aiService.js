const generateAISummary = async (company, reviews) => {
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? reviews.reduce((sum, review) => sum + (review.rating?.overall || 0), 0) / reviewCount
    : 0;

  const sentimentCounts = reviews.reduce(
    (acc, review) => {
      acc[review.sentiment] = (acc[review.sentiment] || 0) + 1;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  return `Summary for ${company.name}: ${reviewCount} recent reviews with an average rating of ${avgRating.toFixed(1)}. Positive sentiment makes up ${reviewCount ? ((sentimentCounts.positive / reviewCount) * 100).toFixed(0) : 0}% of recent feedback.`;
};

const getChatbotResponse = async (message, context) => {
  const suffix = context ? ` Context: ${JSON.stringify(context)}` : '';
  return `Chatbot reply: I received your message "${message}".${suffix}`;
};

const getRecommendations = (companies, filters = {}) => {
  let candidates = Array.isArray(companies) ? companies.slice() : [];
  if (filters.industry) {
    candidates = candidates.filter((c) => c.industry?.toLowerCase() === filters.industry.toLowerCase());
  }
  if (filters.minRating) {
    candidates = candidates.filter((c) => (c.ratings?.overall || 0) >= filters.minRating);
  }
  return candidates
    .sort((a, b) => (b.ratings?.overall || 0) - (a.ratings?.overall || 0))
    .slice(0, 10)
    .map((c) => ({ name: c.name, slug: c.slug, industry: c.industry, overallRating: c.ratings?.overall || 0, trustScore: c.trustScore || 0 }));
};

const analyzeSentiment = (text, rating) => {
  const normalizedText = (text || '').toLowerCase();
  const sentiment = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';
  const keywords = [];

  if (normalizedText.includes('great') || normalizedText.includes('excellent')) keywords.push('positive');
  if (normalizedText.includes('bad') || normalizedText.includes('poor')) keywords.push('concern');
  if (normalizedText.includes('flexible') || normalizedText.includes('culture')) keywords.push('culture');

  return {
    sentiment,
    score: sentiment === 'positive' ? 0.7 : sentiment === 'negative' ? -0.5 : 0,
    emotion: sentiment === 'positive' ? 'happy' : sentiment === 'negative' ? 'angry' : 'neutral',
    keywords,
  };
};

const detectFakeReview = () => ({ isFake: false });

const detectToxicity = () => ({ isToxic: false, toxicityScore: 0 });

const generateAIComparisonVerdict = async (comparison) => {
  const winner = comparison.reduce((best, cur) => ((cur.trustScore || 0) + (cur.overallRating || 0)) > ((best.trustScore || 0) + (best.overallRating || 0)) ? cur : best, comparison[0] || {});
  return `Based on the available metrics, ${winner.name || 'the comparison'} appears strongest, with a combined trust and rating edge over the other companies.`;
};

module.exports = {
  generateAISummary,
  getChatbotResponse,
  getRecommendations,
  analyzeSentiment,
  detectFakeReview,
  detectToxicity,
  generateAIComparisonVerdict,
};
