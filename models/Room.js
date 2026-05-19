const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    players: {
      type: Array,
      default: [],
    },
    board: {
      type: Array,
      default: Array(9).fill(""),
    },
    turn: {
      type: String,
      default: "X",
    },
    winner: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Room", roomSchema);
