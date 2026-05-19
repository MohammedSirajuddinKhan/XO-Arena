const Room = require("../models/Room");
const calculateWinner = require("../utils/calculateWinner");

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", async ({ roomCode, player }) => {
      socket.join(roomCode);

      let room = await Room.findOne({ roomCode });

      if (!room) {
        room = await Room.create({
          roomCode,
          players: [player],
          board: Array(9).fill(""),
          turn: "X",
        });
      } else {
        if (!room.players.includes(player)) {
          room.players.push(player);
          await room.save();
        }
      }

      io.to(roomCode).emit("update-room", room);
    });

    socket.on("make-move", async ({ roomCode, index, symbol }) => {
      const room = await Room.findOne({ roomCode });

      if (!room || room.board[index] !== "") return;

      room.board[index] = symbol;
      room.turn = symbol === "X" ? "O" : "X";

      const winner = calculateWinner(room.board);

      if (winner) {
        room.winner = winner;
      }

      await room.save();

      io.to(roomCode).emit("update-room", room);
    });

    socket.on("restart-game", async (roomCode) => {
      const room = await Room.findOne({ roomCode });

      if (!room) return;

      room.board = Array(9).fill("");
      room.turn = "X";
      room.winner = null;

      await room.save();

      io.to(roomCode).emit("update-room", room);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
