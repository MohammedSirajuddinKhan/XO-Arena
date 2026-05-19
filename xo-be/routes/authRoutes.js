const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", authController.getLogin);
router.get("/register", authController.getRegister);

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/guest", authController.guestLogin);

router.get("/logout", authController.logoutUser);

module.exports = router;
