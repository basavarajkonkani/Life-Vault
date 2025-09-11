const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Allow demo token
  if (token === 'demo-token') {
    req.user = { id: 'demo-user-123' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
