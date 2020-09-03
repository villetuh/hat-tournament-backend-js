const tournamentsRouter = require('express').Router();
const playerPoolsRouter = require('./playerpools');
const playersRouter = require('./players');
const teamsRouter = require('./teams');

const Tournament = require('../models/tournament');
const User = require('../models/user');
const authenticateJWT = require('../utils/middleware').authenticateJWT;

tournamentsRouter.use(authenticateJWT);

tournamentsRouter.get('/', async (request, response) => {
  const tournaments = await Tournament.find({ user: request.user.id });
  
  return response.json(tournaments);
});

tournamentsRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.id);

  if (tournament === null || tournament.user.toString() !== user.id.toString()) {
    return response.status(404).end();
  }

  return response.json(tournament);
});

tournamentsRouter.post('/', async (request, response) => {
  const user = await User.findById(request.user.id);

  if (user == null) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  const tournament = new Tournament({
    ...request.body,
    user: user._id
  });

  const savedTournament = await tournament.save();

  user.tournaments = user.tournaments.concat(savedTournament._id);
  await user.save();

  return response.status(201).json(savedTournament);
});

tournamentsRouter.delete('/:id', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.id);

  if (tournament == null || tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  await tournament.deleteOne();

  user.tournaments = user.tournaments.filter(tournament => tournament != null && tournament.toString() !== request.params.id);
  await user.save();

  return response.status(204).end();
});

tournamentsRouter.put('/:id', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.id);

  if (tournament == null || tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  let updatedTournament = {
    name: request.body.name,
    players: request.body.players,
    playerPools: request.body.playerPools,
    teams: request.body.teams,
    user: user.id
  };

  updatedTournament = await Tournament.findByIdAndUpdate(request.params.id, updatedTournament, { new: true });

  return response.json(updatedTournament);
});

tournamentsRouter.use('/:tournamentId/playerpools', playerPoolsRouter);
tournamentsRouter.use('/:tournamentId/players', playersRouter);
tournamentsRouter.use('/:tournamentId/teams', teamsRouter);

module.exports = tournamentsRouter;
