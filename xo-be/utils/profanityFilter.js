const blockedWords = ["damn", "hell", "shit", "fuck"];

function filterProfanity(message) {
  let clean = String(message || "");

  blockedWords.forEach((word) => {
    clean = clean.replace(new RegExp(word, "gi"), "*".repeat(word.length));
  });

  return clean;
}

module.exports = filterProfanity;
