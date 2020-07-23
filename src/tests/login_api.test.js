const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');

require('dotenv').config();

const app = require('../app');
const User = require('../models/user');

const api = supertest(app);

afterAll(async () => {
  await User.deleteMany({});
  mongoose.connection.close();
});

describe('when there is a user', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash(process.env.TEST_USER_PASSWORD, 10);
    const user = new User({
      username: process.env.TEST_USER_USERNAME,
      passwordHash
    });

    await user.save();
  });

  test('providing correct user details returns a token', async () => {
    const userDetails = {
      username: process.env.TEST_USER_USERNAME,
      password: process.env.TEST_USER_PASSWORD
    };

    const response = await api.post('/api/login')
      .send(userDetails)
      .expect(200);

    expect(response.body.token).toBeDefined();
  });

  test('providing incorrect username returns and error response', async () => {
    const userDetails = {
      username: process.env.TEST_USER_USERNAME + '2',
      password: process.env.TEST_USER_PASSWORD
    };

    await api.post('/api/login')
      .send(userDetails)
      .expect(401);
  });

  test('providing incorrect password returns and error response', async () => {
    const userDetails = {
      username: process.env.TEST_USER_USERNAME,
      password: process.env.TEST_USER_PASSWORD + '1'
    };

    await api.post('/api/login')
      .send(userDetails)
      .expect(401);
  });
});
