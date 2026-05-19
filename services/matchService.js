const Game = require("../models/Game");
const User = require("../models/User");
const { nextRating } = require("./rankingService");

function durationSeconds(room) {
  if (!room.startedAt) return 0;
  const end = room.finishedAt || new Date();
  return Math.max(0, Math.round((end - room.startedAt) / 1000));
}

async function saveCompletedMatch(room) {
  const existing = await Game.findOne({ replayCode: `${room.roomCode}-${room.updatedAt?.getTime()}` });
  if (existing) return existing;

  return Game.create({
    roomCode: room.roomCode,
    players: room.players.map((player) => player.name),
    winner: room.winner,
    draw: room.draw,
    moves: room.moveHistory,
    durationSeconds: durationSeconds(room),
    finalBoard: room.board,
    replayCode: `${room.roomCode}-${Date.now()}`,
  });
}

async function updatePlayerStats(room) {
  const matchedUsers = await User.find({
    username: { $in: room.players.map((player) => player.name) },
  });

  if (matchedUsers.length === 0) return;

  const byName = new Map(matchedUsers.map((user) => [user.username, user]));
  const [playerA, playerB] = room.players;
  const userA = byName.get(playerA?.name);
  const userB = byName.get(playerB?.name);

  if (room.draw) {
    await User.updateMany(
      { username: { $in: room.players.map((player) => player.name) } },
      { $inc: { draws: 1 }, $set: { currentStreak: 0 } },
    );
    if (userA && userB) {
      userA.elo = nextRating(userA.elo, userB.elo, 0.5);
      userB.elo = nextRating(userB.elo, userA.elo, 0.5);
      await Promise.all([userA.save(), userB.save()]);
    }
    return;
  }

  await Promise.all(
    matchedUsers.map(async (user) => {
      const won = user.username === room.winner;
      user.wins += won ? 1 : 0;
      user.losses += won ? 0 : 1;
      user.currentStreak = won ? user.currentStreak + 1 : 0;
      user.bestStreak = Math.max(user.bestStreak, user.currentStreak);
      return user.save();
    }),
  );

  if (userA && userB) {
    const aWon = userA.username === room.winner;
    const oldA = userA.elo;
    const oldB = userB.elo;
    userA.elo = nextRating(oldA, oldB, aWon ? 1 : 0);
    userB.elo = nextRating(oldB, oldA, aWon ? 0 : 1);
    await Promise.all([userA.save(), userB.save()]);
  }
}

module.exports = {
  saveCompletedMatch,
  updatePlayerStats,
};
