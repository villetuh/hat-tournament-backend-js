const playersRouter = require('express').Router({ mergeParams: true });

const Player = require('../models/player');
const PlayerPool = require('../models/playerpool');
const Team = require('../models/team');
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

  await updatePlayerReferenceToPlayerPool(savedPlayer);
  await updatePlayerReferenceToTeam(savedPlayer);
  await updatePlayerReferenceToTournament(savedPlayer, tournament);

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

  await removePlayerReferenceFromPlayerPool(player);
  await removePlayerReferenceFromTeam(player);
  await removePlayerReferenceFromTournament(player, tournament);

  await player.deleteOne();

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
    playerPool: request.body.playerPool,
    team: request.body.team,
    tournament: tournament.id,
    user: user.id
  };

  await removePlayerReferenceFromPlayerPool(player);
  await removePlayerReferenceFromTeam(player);

  updatedPlayer = await Player.findByIdAndUpdate(request.params.id, updatedPlayer, { new: true });

  await updatePlayerReferenceToPlayerPool(updatedPlayer);
  await updatePlayerReferenceToTeam(updatedPlayer);

  return response.json(updatedPlayer);
});

async function updatePlayerReferenceToPlayerPool(player) {
  if (player.playerPool === undefined) {
    return;
  }

  const playerPool = await PlayerPool.findById(player.playerPool);
  if (playerPool == null) {
    return;
  }
  playerPool.players = playerPool.players.concat(player.id);
  await playerPool.save();
}

async function updatePlayerReferenceToTeam(player) {
  if (player.team === undefined) {
    return;
  }

  const team = await Team.findById(player.team);
  if (team == null) {
    return;
  }
  team.players = team.players.concat(player.id);
  await team.save();
}

async function updatePlayerReferenceToTournament(player, tournament) {
  if (tournament === undefined) {
    tournament = await Tournament.findById(player.tournamentId);
  }

  tournament.players = tournament.players.concat(player.id);
  await tournament.save();
}

async function removePlayerReferenceFromPlayerPool(player) {
  if (player.playerPool === undefined) {
    return;
  }

  const playerPool = await PlayerPool.findById(player.playerPool);

  if (playerPool == null) {
    return;
  }

  playerPool.players = playerPool.players.filter(p => p != null && p.toString() != player.id.toString());
  await playerPool.save();
}

async function removePlayerReferenceFromTeam(player) {
  if (player.team === undefined) {
    return;
  }

  const team = await Team.findById(player.team);

  if (team == null) {
    return;
  }

  team.players = team.players.filter(p => p != null && p.toString() != player.id.toString());
  await team.save();
}

async function removePlayerReferenceFromTournament(player, tournament) {
  if (tournament === undefined) {
    tournament = await Tournament.findById(player.tournamentId);
  }

  tournament.players = tournament.players.filter(p => p != null && p.toString() !== player.id.toString());
  await tournament.save();
}

module.exports = playersRouter;
