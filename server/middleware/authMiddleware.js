const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

const authMiddleware = (req, res, next) => {
  // 1. Get token from the Authorization header
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // 2. Handle both 'Bearer <token>' and raw token formats
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  try {
    // 3. Verify token with secret key
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Attach decoded payload (e.g. { id: user._id }) to the request object
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;