const playerPoolsRouter = require('express').Router({ mergeParams: true });

const PlayerPool = require('../models/playerpool');
const Tournament = require('../models/tournament');
const User = require('../models/user');
const authenticateJWT = require('../utils/middleware').authenticateJWT;

playerPoolsRouter.use(authenticateJWT);

playerPoolsRouter.get('/', async (request, response) => {
  const playerPools = await PlayerPool.find({ 
    tournament: request.params.tournamentId, 
    user: request.user.id 
  });
  return response.json(playerPools);
});

playerPoolsRouter.get('/:id', async (request, response) => {
  const playerPool = await PlayerPool.find({ 
    _id: request.params.id, 
    tournament: request.params.tournamentId, 
    user: request.user.id 
  });

  if (playerPool === null) {
    return response.status(404).end();
  }

  return response.json(playerPool);
});

playerPoolsRouter.post('/', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.tournamentId);

  if (tournament == null) {
    return response.status(400).json({ error: 'Request didn\'t contain valid data.' });
  }

  if (user == null || tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  const playerPool = new PlayerPool({
    ...request.body,
    tournament: tournament._id,
    user: user._id
  });

  const savedPlayerPool = await playerPool.save();

  tournament.playerPools = tournament.playerPools.concat(savedPlayerPool._id);
  await tournament.save();

  return response.status(201).json(savedPlayerPool);
});

playerPoolsRouter.delete('/:id', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.tournamentId);
  const playerPool = await PlayerPool.findById(request.params.id);

  if (tournament == null || playerPool == null ||
      playerPool.user.toString() !== user.id.toString() ||
      playerPool.tournament.toString() !== tournament.id.toString() ||
      tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  await playerPool.deleteOne();

  tournament.playerPools = tournament.playerPools.filter(playerPool => playerPool != null && playerPool.toString() !== request.params.id);
  await tournament.save();

  return response.status(204).end();
});

playerPoolsRouter.put('/:id', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.tournamentId);
  const playerPool = await PlayerPool.findById(request.params.id);

  if (tournament == null || playerPool == null ||
      playerPool.user.toString() !== user.id.toString() ||
      playerPool.tournament.toString() !== tournament.id.toString() ||
      tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  let updatedPlayerPool = {
    name: request.body.name,
    tournament: tournament.id,
    user: user.id
  };

  updatedPlayerPool = await PlayerPool.findByIdAndUpdate(request.params.id, updatedPlayerPool, { new: true });

  return response.json(updatedPlayerPool);
});

module.exports = playerPoolsRouter;
