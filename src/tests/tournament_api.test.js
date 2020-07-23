const mongoose = require('mongoose');
const supertest = require('supertest');

const app = require('../app');
const Tournament = require('../models/tournament');

const api = supertest(app);

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

beforeEach(async () => {
  await Tournament.deleteMany({});

  for (const tournament of initialTournaments) {
    const newTournament = new Tournament({
      ...tournament
    });
    const savedTournament = await newTournament.save();
    tournament.id = savedTournament.id;
  }
});

afterAll(() => {
  mongoose.connection.close();
});

describe('when there is initially tournaments in database', () => {
  test('tournaments are returned as json', async () => {
    await api
      .get('/api/tournaments')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('response with matching number of items is received', async () => {
    const response = await api.get('/api/tournaments');

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
      .send(newTournament);

    const getResponse = await api
      .get('/api/tournaments');

    expect(getResponse.body).toHaveLength(initialTournaments.length + 1);
    expect(getResponse.body).toContainEqual(postResponse.body);
  });

  test('deleting tournament removes it correctly', async () => {
    await api
      .delete(`/api/tournaments/${initialTournaments[0].id}`);

    const getResponse = await api
      .get('/api/tournaments');

    expect(getResponse.body).toHaveLength(initialTournaments.length - 1);
    expect(getResponse.body).not.toContainEqual(initialTournaments[0]);
  });

  test('updating tournament updates it correctly', async () => {
    const updatedTournament = {
      ...initialTournaments[0],
      name: 'UpdatedTournament'
    };

    const putResponse = await api
      .put(`/api/tournaments/${initialTournaments[0].id}`);

    const getResponse = await api
      .get(`/api/tournaments/${initialTournaments[0].id}`);

    expect(putResponse.body).toEqual(getResponse.body);
  });
});

describe('correct status code is returned when', () => {
  test('requesting all tournaments', async () => {
    await api
      .get('/api/tournaments')
      .expect(200);
  });
  
  test('requesting tournament with id that is found', async () => {
    await api
      .get(`/api/tournaments/${initialTournaments[0].id}`)
      .expect(200);
  });
  
  test('requesting tournament with id that isn\'t found', async () => {
    await api
      .get('/api/tournaments/5f1888da1015da0f08ff23bb')
      .expect(404);
  });
  
  test('requesting tournament with id that isn\'t valid', async () => {
    await api
      .get('/api/tournaments/abbaacdc')
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
      .send(newTournament)
      .expect(201);
  });
  
  test('deleting tournament that is found', async () => {
    await api
      .delete(`/api/tournaments/${initialTournaments[0].id}`)
      .expect(204);
  });

  test('deleting tournament that isn\'t found', async () => {
    await api
      .delete('/api/tournaments/5f1888da1015da0f08ff23bb')
      .expect(404);
  });

  test('deleting tournament with id that isn\'t valid', async () => {
    await api
      .delete('/api/tournaments/abbaacdc')
      .expect(400);
  });

  test('updating tournament that is found', async () => {
    const updatedTournament = {
      ...initialTournaments[0],
      name: 'UpdatedTournament'
    };
    
    await api
      .put(`/api/tournaments/${initialTournaments[0].id}`)
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
      .send(updatedTournament)
      .expect(404);
  });

  test('updating tournament with id that isn\'t valid', async () => {
    const updatedTournament = {
      ...initialTournaments[0],
      name: 'UpdatedTournament',
      id: 'abbaacdc'
    };

    await api
      .put('/api/tournaments/abbaacdc')
      .send(updatedTournament)
      .expect(400);
  });
});
