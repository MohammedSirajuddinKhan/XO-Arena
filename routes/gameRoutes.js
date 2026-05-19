const express = require("express");
const router = express.Router();

const gameController = require("../controllers/gameController");
const isLoggedIn = require("../middlewares/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", gameController.getHome);

router.get("/lobby", isLoggedIn, asyncHandler(gameController.getLobby));
router.post("/create-room", isLoggedIn, asyncHandler(gameController.createRoom));
router.post("/join-room", isLoggedIn, asyncHandler(gameController.joinRoom));

router.get("/room/:roomCode", isLoggedIn, asyncHandler(gameController.getRoom));

router.get("/leaderboard", isLoggedIn, asyncHandler(gameController.getLeaderboard));
router.get("/replay/:gameId", isLoggedIn, asyncHandler(gameController.getReplay));

module.exports = router;
