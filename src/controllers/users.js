const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();

const User = require('../models/user');
const ValidationError = require('../utils/errors').ValidationError;

usersRouter.post('/', async (request, response) => {
  const body = request.body;

  if (body.password === undefined || body.password === '' || body.password.length < 3) {
    throw new ValidationError('Password needs to be at least 3 characters long.');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    passwordHash
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;