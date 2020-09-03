const teamsRouter = require('express').Router({ mergeParams: true });

const Player = require('../models/player');
const Team = require('../models/team');
const Tournament = require('../models/tournament');
const User = require('../models/user');
const authenticateJWT = require('../utils/middleware').authenticateJWT;

teamsRouter.use(authenticateJWT);

teamsRouter.get('/', async (request, response) => {
  const teams = await Team.find({ 
    tournament: request.params.tournamentId, 
    user: request.user.id 
  });
  return response.json(teams);
});

teamsRouter.get('/:id', async (request, response) => {
  const team = await Team.find({ 
    _id: request.params.id, 
    tournament: request.params.tournamentId, 
    user: request.user.id 
  });

  if (team === null) {
    return response.status(404).end();
  }

  return response.json(team);
});

teamsRouter.post('/', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.tournamentId);

  if (tournament == null) {
    return response.status(400).json({ error: 'Request didn\'t contain valid data.' });
  }

  if (user == null || tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  const team = new Team({
    ...request.body,
    tournament: tournament._id,
    user: user._id
  });

  const savedTeam = await team.save();

  tournament.teams = tournament.teams.concat(savedTeam._id);
  await tournament.save();

  await updateTeamReferencesToPlayers(team.id, team.players);

  return response.status(201).json(savedTeam);
});

teamsRouter.delete('/:id', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.tournamentId);
  const team = await Team.findById(request.params.id);

  if (tournament == null || team == null ||
      team.user.toString() !== user.id.toString() ||
      team.tournament.toString() !== tournament.id.toString() ||
      tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  await removeTeamReferencesFromPlayers(team.players);

  await team.deleteOne();

  tournament.teams = tournament.teams.filter(team => team != null && team.toString() !== request.params.id);
  await tournament.save();

  return response.status(204).end();
});

teamsRouter.put('/:id', async (request, response) => {
  const user = await User.findById(request.user.id);
  const tournament = await Tournament.findById(request.params.tournamentId);
  const team = await Team.findById(request.params.id);

  if (tournament == null || team == null ||
      team.user.toString() !== user.id.toString() ||
      team.tournament.toString() !== tournament.id.toString() ||
      tournament.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Unauthorized request' });
  }

  let updatedTeam = {
    name: request.body.name,
    players: request.body.players,
    tournament: tournament.id,
    user: user.id
  };

  updatedTeam = await Team.findByIdAndUpdate(request.params.id, updatedTeam, { new: true });

  await updateTeamReferencesToPlayers(updatedTeam.id, updatedTeam.players);

  return response.json(updatedTeam);
});

async function updateTeamReferencesToPlayers(newTeamId, players) {
  if (players === undefined) {
    return;
  }
  
  for (let i = 0; i < players.length; i++) {
    const player = await Player.findById(players[i]);
    if (player == null) {
      return;
    }

    // Remove reference from previous team
    if (player.team !== undefined) {
      const previousTeam = await Team.findById(player.team);
      previousTeam.players = previousTeam.players.filter(p => p != null && p.toString() !== player.id);
      await previousTeam.save();
    }

    // Update team information to player
    player.team = newTeamId;
    await player.save();
  }
}

async function removeTeamReferencesFromPlayers(players) {
  if (players === undefined) {
    return;
  }
  
  for (let i = 0; i < players.length; i++) {
    const player = await Player.findById(players[i]);
    if (player == null) {
      return;
    }

    // Remove team information from player
    player.team = undefined;
    await player.save();
  }
}

module.exports = teamsRouter;
