const serverless = require('serverless-http');
const app = require('../../server/server'); // Path to the Express app

// Wrap the Express app for Serverless
module.exports.handler = serverless(app);
