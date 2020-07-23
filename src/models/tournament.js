const mongoose = require('mongoose');

const tournamentSchema = mongoose.Schema({
  name: { type: String, required: true },
  players: [
    {
      type: String
    }
  ],
  playerPools: [
    {
      type: String
    }
  ],
  teams: [
    {
      type: String
    }
  ]
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
