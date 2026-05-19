const Room = require("../models/Room");

exports.findRoomByCode = async (roomCode) => {
  return await Room.findOne({ roomCode });
};
