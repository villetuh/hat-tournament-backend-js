require('../utils/logger');

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
  errorHandler
};