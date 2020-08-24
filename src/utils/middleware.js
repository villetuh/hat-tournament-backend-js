const jwt = require('jsonwebtoken');
require('../utils/logger');

const authenticateJWT = (request, response, next) => {
  const authHeader = request.get('authorization');

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.SECRET, (error, user) => {
      if (error) {
        return response.sendStatus(403);
      }

      request.user = user;
      next();
    });
  } else {
    response.sendStatus(401);
  }
};

const errorHandler = (error, request, response, next) => {

  // Add custom error handlers
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Unsupported id format.' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }
  
  next(error);
};

module.exports = {
  authenticateJWT,
  errorHandler
};