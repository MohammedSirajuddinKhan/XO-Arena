const Room = require("../models/Room");

exports.findRoomByCode = async (roomCode) => {
  return await Room.findOne({ roomCode });
};

exports.cleanupExpiredRooms = async () => {
  return Room.deleteMany({
    expiresAt: { $lte: new Date() },
  });
};
