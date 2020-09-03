const playersRouter = require('express').Router({ mergeParams: true });

const Player = require('../models/player');
const Tournament = require('../models/tournament');
const User = require('../models/user');
const authenticateJWT = require('../utils/middleware').authenticateJWT;

playersRouter.use(authenticateJWT);

playersRouter.get('/', async (request, response) => {
  const players = await Player.find({ 
    tournament: request.params.tournamentId, 
    user: request.user.id 
  });
  
  return response.json(players);
});

playersRouter.get('/:id', async (request, response) => {
  const player = await Player.find({ 
    _id: request.params.id, 
    tournament: request.params.tournamentId, 
    user: request.user.id 
  });

  if (player === null) {
    return response.status(404).end();
  }

  return response.json(player);
});

playersRouter.post('/', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.tournamentId);

  if (tournament == null) {
    return response.status(400).json({ error: 'Request didn\'t contain valid data.' });
  }

  if (user == null || tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  const player = new Player({
    ...request.body,
    tournament: tournament._id,
    user: user._id
  });

  const savedPlayer = await player.save();

  tournament.players = tournament.players.concat(savedPlayer._id);
  await tournament.save();

  return response.status(201).json(savedPlayer);
});

playersRouter.delete('/:id', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.tournamentId);
  const player = await Player.findById(request.params.id);

  if (tournament == null || player == null ||
      player.user.toString() !== user.id.toString() ||
      player.tournament.toString() !== tournament.id.toString() ||
      tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  await player.deleteOne();

  tournament.players = tournament.players.filter(player => player != null && player.toString() !== request.params.id);
  await tournament.save();

  return response.status(204).end();
});

playersRouter.put('/:id', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.tournamentId);
  const player = await Player.findById(request.params.id);

  if (tournament == null || player == null ||
      player.user.toString() !== user.id.toString() ||
      player.tournament.toString() !== tournament.id.toString() ||
      tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  let updatedPlayer = {
    name: request.body.name,
    tournament: tournament.id,
    user: user.id
  };

  updatedPlayer = await Player.findByIdAndUpdate(request.params.id, updatedPlayer, { new: true });

  return response.json(updatedPlayer);
});

module.exports = playersRouter;
