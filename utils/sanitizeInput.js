function sanitizeInput(value, maxLength = 80) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

module.exports = sanitizeInput;
