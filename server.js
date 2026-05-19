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

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

require("./config/socket")(io);

const PORT = process.env.PORT || 3000;

server.on("error", (error) => {
  console.error("Server error:", error.message);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
