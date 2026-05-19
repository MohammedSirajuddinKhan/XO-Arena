const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const isLoggedIn = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/profile", isLoggedIn, userController.getProfile);
router.post("/profile/avatar", isLoggedIn, upload.single("avatar"), userController.updateAvatar);

module.exports = router;
