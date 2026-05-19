const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    roomCode: String,
    players: [String],
    winner: {
      type: String,
      default: null,
    },
    moves: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Game", gameSchema);
