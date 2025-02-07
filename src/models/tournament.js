const mongoose = require('mongoose');

const tournamentSchema = mongoose.Schema({
  name: { type: String, required: true },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }
  ],
  playerPools: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlayerPool'
    }
  ],
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

tournamentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
