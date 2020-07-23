const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();

const logger = require('../utils/logger');

const User = require('../models/user');

loginRouter.post('/', async (request, response) => {
  const userDetails = request.body;

  const user = await User.findOne({ username: userDetails.username });

  const correctPassword = user === null
    ? false
    : await bcrypt.compare(userDetails.password, user.passwordHash);

  if (!user || !correctPassword) {
    return response.status(401).json({
      error: 'Invalid username or password.'
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id
  };

  if (process.env.SECRET === undefined) {
    logger.error('LoginController missing required environmental variable.');
    return response.status(500).end();
  }

  const token = jwt.sign(userForToken, process.env.SECRET);

  return response.status(200).send({ token, username: user.username });
});

module.exports = loginRouter;
