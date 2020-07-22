const { response } = require('express');

const tournamentsRouter = require('express').Router();

let tournaments = [
  {
    id: "1",
    name: "Tournament1",
    players: [],
    playerPools: [],
    teams: []
  },
  {
    id: "2",
    name: "Tournament2",
    players: [],
    playerPools: [],
    teams: []
  }
];
let nextId = 3;

tournamentsRouter.get('/', async (request, response) => {
  return response.json(tournaments);
});

tournamentsRouter.get('/:id', async (request, response) => {
  const tournament = tournaments.find(tournament => tournament.id === request.params.id);
  
  if (tournament === undefined) {
    return response.status(404).end();
  }
  return response.json(tournament);
});

tournamentsRouter.post('/', async (request, response) => {
  const tournament = {
    ...request.body,
    id: nextId.toString(),
  }

  nextId++;
  tournaments.push(tournament);

  return response.status(201).json(tournament);
});

tournamentsRouter.delete('/:id', async (request, response) => {
  const tournament = tournaments.find(tournament => tournament.id === request.params.id);
  if (tournament !== undefined) {
    tournaments.splice(tournaments.indexOf(tournament), 1);
  }

  return response.status(204).end();
});

tournamentsRouter.put('/:id', async (request, response) => {
  const tournament = tournaments.find(tournament => tournament.id === request.params.id);
  if (tournament === undefined) {
    return response.status(400).end();
  }

  tournament.name = request.body.name;
  tournament.players = request.body.players;
  tournament.playerPools = request.body.playerPools;
  tournament.teams = request.body.teams;

  return response.json(tournament);
});

module.exports = tournamentsRouter;
