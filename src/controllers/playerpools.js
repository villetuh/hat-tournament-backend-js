const playerPoolsRouter = require('express').Router({ mergeParams: true });

const Player = require('../models/player');
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

  await updatePlayerPoolReferencesToPlayers(playerPool.id, playerPool.players);

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

  await removePlayerPoolReferencesFromPlayers(playerPool.players);

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
    players: request.body.players,
    tournament: tournament.id,
    user: user.id
  };

  updatedPlayerPool = await PlayerPool.findByIdAndUpdate(request.params.id, updatedPlayerPool, { new: true });

  await updatePlayerPoolReferencesToPlayers(updatedPlayerPool.id, updatedPlayerPool.players);

  return response.json(updatedPlayerPool);
});

async function updatePlayerPoolReferencesToPlayers(newPlayerPoolId, players) {
  if (players === undefined) {
    return;
  }
  
  for (let i = 0; i < players.length; i++) {
    const player = await Player.findById(players[i]);
    if (player == null) {
      return;
    }

    // Remove reference from previous player pool
    if (player.playerPool !== undefined) {
      const previousPlayerPool = await PlayerPool.findById(player.playerPool);
      previousPlayerPool.players = previousPlayerPool.players.filter(p => p != null && p.toString() !== player.id);
      await previousPlayerPool.save();
    }

    // Update player pool information to player
    player.playerPool = newPlayerPoolId;
    await player.save();
  }
}

async function removePlayerPoolReferencesFromPlayers(players) {
  if (players === undefined) {
    return;
  }
  
  for (let i = 0; i < players.length; i++) {
    const player = await Player.findById(players[i]);
    if (player == null) {
      return;
    }

    // Update player pool information to player
    player.playerPool = undefined;
    await player.save();
  }
}

module.exports = playerPoolsRouter;
