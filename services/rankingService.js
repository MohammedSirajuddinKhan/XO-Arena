const K_FACTOR = 32;

function expectedScore(playerRating, opponentRating) {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
}

function nextRating(playerRating, opponentRating, score) {
  return Math.round(
    playerRating + K_FACTOR * (score - expectedScore(playerRating, opponentRating)),
  );
}

function getRankBadge(elo = 1000) {
  if (elo >= 1800) return "Diamond";
  if (elo >= 1600) return "Platinum";
  if (elo >= 1400) return "Gold";
  if (elo >= 1200) return "Silver";
  return "Bronze";
}

module.exports = {
  nextRating,
  getRankBadge,
};
