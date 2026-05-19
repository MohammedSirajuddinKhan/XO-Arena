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
    draw: {
      type: Boolean,
      default: false,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    finalBoard: {
      type: Array,
      default: [],
    },
    replayCode: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Game", gameSchema);
