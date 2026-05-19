const express = require("express");
const router = express.Router();

const gameController = require("../controllers/gameController");
const isLoggedIn = require("../middlewares/authMiddleware");

router.get("/", gameController.getHome);

router.get("/lobby", isLoggedIn, gameController.getLobby);
router.post("/create-room", isLoggedIn, gameController.createRoom);
router.post("/join-room", isLoggedIn, gameController.joinRoom);

router.get("/room/:roomCode", isLoggedIn, gameController.getRoom);

router.get("/leaderboard", isLoggedIn, gameController.getLeaderboard);
router.get("/replay/:gameId", isLoggedIn, gameController.getReplay);

module.exports = router;
