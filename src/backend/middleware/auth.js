/**
 * Authentication Middleware
 * Simple API key validation for MVP
 * In production, would use proper OAuth/JWT
 */

const validApiKeys = [
  'test-api-key-123',
  'dev-api-key-456',
  'merchant-api-key-789'
];

/**
 * Validate API key from request
 */
function authMiddleware(req, res, next) {
  // For health check, skip auth
  if (req.path === '/health') {
    return next();
  }

  // Get API key from header or query param
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({
      error: {
        code: 'MISSING_API_KEY',
        description: 'API key required. Provide in X-API-Key header or api_key query parameter'
      }
    });
  }

  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: {
        code: 'INVALID_API_KEY',
        description: 'Invalid API key'
      }
    });
  }

  // Attach API key to request for logging
  req.apiKey = apiKey;
  next();
}

module.exports = {
  authMiddleware,
  validApiKeys
};
