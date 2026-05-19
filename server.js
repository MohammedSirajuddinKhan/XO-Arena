const http = require("http");
const { Server } = require("socket.io");

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const app = require("./app");

const server = http.createServer(app);
const socketOrigin = process.env.SOCKET_CORS_ORIGIN || process.env.CLIENT_ORIGIN || "*";

const io = new Server(server, {
  cors: {
    origin: socketOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

require("./config/socket")(io);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "::";

server.on("error", (error) => {
  console.error("Server error:", error.message);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Chrome-safe URL: http://127.0.0.1:${PORT}`);
  console.log(`Listening on ${HOST}:${PORT}`);
});
