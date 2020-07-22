const tournamentsRouter = require('express').Router();

const Tournament = require('../models/tournament');

tournamentsRouter.get('/', async (request, response) => {
  const tournaments = await Tournament.find({});
  
  return response.json(tournaments);
});

tournamentsRouter.get('/:id', async (request, response) => {
  const tournament = await Tournament.findById(request.params.id);
  if (tournament === null) {
    return response.status(404).end();
  }

  return response.json(tournament);
});

tournamentsRouter.post('/', async (request, response) => {
  const tournament = new Tournament({
    ...request.body
  });

  const savedTournament = await tournament.save();

  return response.status(201).json(savedTournament);
});

tournamentsRouter.delete('/:id', async (request, response) => {
  const tournament = await Tournament.findById(request.params.id);

  if (tournament !== undefined) {
    await tournament.deleteOne();
  }

  return response.status(204).end();
});

tournamentsRouter.put('/:id', async (request, response) => {
  let updatedTournament = {
    name: request.body.name,
    players: request.body.players,
    playerPools: request.body.playerPools,
    teams: request.body.teams
  };

  updatedTournament = await Tournament.findByIdAndUpdate(request.params.id, updatedTournament, { new: true });

  return response.json(updatedTournament);
});

module.exports = tournamentsRouter;
