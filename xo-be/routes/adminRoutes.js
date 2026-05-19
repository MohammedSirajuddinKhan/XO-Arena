const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const isLoggedIn = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");

router.get("/admin", isLoggedIn, isAdmin, adminController.getDashboard);
router.post("/admin/rooms/:roomId/delete", isLoggedIn, isAdmin, adminController.deleteRoom);
router.post("/admin/users/:userId/ban", isLoggedIn, isAdmin, adminController.banUser);

module.exports = router;
