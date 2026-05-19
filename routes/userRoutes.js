const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const isLoggedIn = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/profile", isLoggedIn, asyncHandler(userController.getProfile));
router.post("/profile/avatar", isLoggedIn, upload.single("avatar"), asyncHandler(userController.updateAvatar));

module.exports = router;
