require('../utils/logger');

const errorHandler = (error, request, response, next) => {

  // Add custom error handlers

  next(error);
};

module.exports = {
  errorHandler
};