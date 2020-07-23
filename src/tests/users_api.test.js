const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');

require('dotenv').config();

const app = require('../app');
const User = require('../models/user');

const api = supertest(app);

const usersInDb = async () => {
  const users = await User.find({});
  return users.map(user => user.toJSON());
};

afterAll(() => {
  mongoose.connection.close();
});

describe('when there is initially users in database', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash(process.env.TEST_USER_PASSWORD, 10);
    const user = new User({
      username: process.env.TEST_USER_USERNAME,
      passwordHash
    });

    await user.save();
  });

  test('adding new user with unique username succeeds', async () => {
    const usersAtStart = await usersInDb();
    
    const newUser = {
      username: process.env.TEST_USER_USERNAME + '2',
      password: process.env.TEST_USER_PASSWORD
    };

    await api.post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(user => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test('adding new user with existing username fails', async () => {
    const usersAtStart = await usersInDb();
    
    const newUser = {
      username: process.env.TEST_USER_USERNAME,
      password: process.env.TEST_USER_PASSWORD
    };

    await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

describe('when adding new user', () => {
  test('if username isn\'t given, error response is received', async () => {
    const newUser = {
      password: process.env.TEST_USER_PASSWORD
    };

    await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('if username is shorter than 3 characters, error response is received', async () => {
    const newUser = {
      username: 'ab',
      password: process.env.TEST_USER_PASSWORD
    };

    await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('if password isn\'t given, error response is received', async () => {
    const newUser = {
      username: process.env.TEST_USER_USERNAME
    };

    await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('if password is shorter than 3 characters, error response is received', async () => {
    const newUser = {
      username: process.env.TEST_USER_USERNAME,
      password: '12'
    };

    await api.post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });
});