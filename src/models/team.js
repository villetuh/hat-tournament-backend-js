const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
  name: { type: String, required: true },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }
  ],
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

teamSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.tournament;
    delete returnedObject.user;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
