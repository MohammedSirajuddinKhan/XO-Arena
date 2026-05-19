exports.isBoardFull = function (board) {
  return board.every((cell) => cell !== "");
};
