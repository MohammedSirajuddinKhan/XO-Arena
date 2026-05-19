const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    players: {
      type: [
        {
          name: String,
          userId: String,
          symbol: String,
          socketId: String,
          online: {
            type: Boolean,
            default: false,
          },
          joinedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    spectators: {
      type: [
        {
          name: String,
          userId: String,
          socketId: String,
          online: {
            type: Boolean,
            default: false,
          },
          joinedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
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
    status: {
      type: String,
      enum: ["waiting", "active", "finished"],
      default: "waiting",
    },
    winner: {
      type: String,
      default: null,
    },
    draw: {
      type: Boolean,
      default: false,
    },
    moveHistory: {
      type: [
        {
          index: Number,
          symbol: String,
          player: String,
          playedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    chat: {
      type: [
        {
          sender: String,
          message: String,
          type: {
            type: String,
            enum: ["user", "system"],
            default: "user",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    rematchVotes: {
      type: [String],
      default: [],
    },
    turnStartedAt: {
      type: Date,
      default: Date.now,
    },
    turnEndsAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 6),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Room", roomSchema);
