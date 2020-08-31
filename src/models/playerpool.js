const mongoose = require('mongoose');

const playerPoolSchema = mongoose.Schema({
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

playerPoolSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const PlayerPool = mongoose.model('PlayerPool', playerPoolSchema);

module.exports = PlayerPool;
