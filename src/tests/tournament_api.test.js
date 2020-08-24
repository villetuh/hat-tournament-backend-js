const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../app');
const Tournament = require('../models/tournament');
const User = require('../models/user');

const api = supertest(app);

const testUsername = 'testuser';
const testPassword = 'sekret';

const initialTournaments = [
  {
    name: 'Tournament1',
    players: [],
    playerPools: [],
    teams: []
  },
  {
    name: 'Tournament2',
    players: [],
    playerPools: [],
    teams: []
  }
];
var testUser;
var token;

beforeAll(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash(testPassword, 10);
  const user = new User({
    username: testUsername,
    name: 'Teemu Testaaja',
    passwordHash
  });

  await user.save();

  testUser = user;

  const loginResponse = await api.post('/api/login')
  .send({ username: 'testuser', password: testPassword });
  token = loginResponse.body.token;
});

beforeEach(async () => {
  await Tournament.deleteMany({});

  for (const tournament of initialTournaments) {
    const newTournament = new Tournament({
      ...tournament,
      user: testUser._id
    });
    const savedTournament = await newTournament.save();
    tournament.id = savedTournament.id;
  }

  testUser.tournaments = initialTournaments.map(tournament => tournament._id);
  await testUser.save();
});

afterAll(() => {
  mongoose.connection.close();
});

describe('when there is initially tournaments in database', () => {
  test('tournaments are returned as json', async () => {
    await api
      .get('/api/tournaments')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('response with matching number of items is received', async () => {
    const response = await api
      .get('/api/tournaments')
      .set('Authorization', 'Bearer ' + token);

    expect(response.body).toHaveLength(initialTournaments.length);
  });

  test('adding new tournament stores it correctly', async () => {
    const newTournament = {
      name: 'Tournament3',
      players: [],
      playerPools: [],
      teams: []
    };
    const postResponse = await api
      .post('/api/tournaments/')
      .set('Authorization', 'Bearer ' + token)
      .send(newTournament);

    const getResponse = await api
      .get('/api/tournaments')
      .set('Authorization', 'Bearer ' + token);

    expect(getResponse.body).toHaveLength(initialTournaments.length + 1);
    expect(getResponse.body).toContainEqual(postResponse.body);
  });

  test('deleting tournament removes it correctly', async () => {
    await api
      .delete(`/api/tournaments/${initialTournaments[0].id}`)
      .set('Authorization', 'Bearer ' + token);

    const getResponse = await api
      .get('/api/tournaments')
      .set('Authorization', 'Bearer ' + token);

    expect(getResponse.body).toHaveLength(initialTournaments.length - 1);
    expect(getResponse.body).not.toContainEqual(initialTournaments[0]);
  });

  test('updating tournament updates it correctly', async () => {
    const updatedTournament = {
      ...initialTournaments[0],
      name: 'UpdatedTournament'
    };

    const putResponse = await api
      .put(`/api/tournaments/${initialTournaments[0].id}`)
      .set('Authorization', 'Bearer ' + token);

    const getResponse = await api
      .get(`/api/tournaments/${initialTournaments[0].id}`)
      .set('Authorization', 'Bearer ' + token);

    expect(putResponse.body).toEqual(getResponse.body);
  });
});

describe('correct status code is returned when', () => {
  test('requesting all tournaments', async () => {
    await api
      .get('/api/tournaments')
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
  });
  
  test('requesting tournament with id that is found', async () => {
    await api
      .get(`/api/tournaments/${initialTournaments[0].id}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(200);
  });
  
  test('requesting tournament with id that isn\'t found', async () => {
    await api
      .get('/api/tournaments/5f1888da1015da0f08ff23bb')
      .set('Authorization', 'Bearer ' + token)
      .expect(404);
  });
  
  test('requesting tournament with id that isn\'t valid', async () => {
    await api
      .get('/api/tournaments/abbaacdc')
      .set('Authorization', 'Bearer ' + token)
      .expect(400);
  });
  
  test('adding new tournament', async () => {
    const newTournament = {
      name: 'Tournament3',
      players: [],
      playerPools: [],
      teams: []
    };
    await api
      .post('/api/tournaments/')
      .set('Authorization', 'Bearer ' + token)
      .send(newTournament)
      .expect(201);
  });
  
  test('deleting tournament that is found', async () => {
    await api
      .delete(`/api/tournaments/${initialTournaments[0].id}`)
      .set('Authorization', 'Bearer ' + token)
      .expect(204);
  });

  test('deleting tournament that isn\'t found', async () => {
    await api
      .delete('/api/tournaments/5f1888da1015da0f08ff23bb')
      .set('Authorization', 'Bearer ' + token)
      .expect(401);
  });

  test('deleting tournament with id that isn\'t valid', async () => {
    await api
      .delete('/api/tournaments/abbaacdc')
      .set('Authorization', 'Bearer ' + token)
      .expect(400);
  });

  test('updating tournament that is found', async () => {
    const updatedTournament = {
      ...initialTournaments[0],
      name: 'UpdatedTournament'
    };
    
    await api
      .put(`/api/tournaments/${initialTournaments[0].id}`)
      .set('Authorization', 'Bearer ' + token)
      .send(updatedTournament)
      .expect(200);
  });

  test('updating tournament that isn\'t found', async () => {
    const updatedTournament = {
      ...initialTournaments[0],
      name: 'UpdatedTournament',
      id: '5f1888da1015da0f08ff23bb'
    };

    await api
      .put('/api/tournaments/5f1888da1015da0f08ff23bb')
      .set('Authorization', 'Bearer ' + token)
      .send(updatedTournament)
      .expect(401);
  });

  test('updating tournament with id that isn\'t valid', async () => {
    const updatedTournament = {
      ...initialTournaments[0],
      name: 'UpdatedTournament',
      id: '5f1888da1015da0f08ff23bb'
    };

    await api
      .put('/api/tournaments/5f1888da1015da0f08ff23bb')
      .set('Authorization', 'Bearer ' + token)
      .send(updatedTournament)
      .expect(401);
  });
});
