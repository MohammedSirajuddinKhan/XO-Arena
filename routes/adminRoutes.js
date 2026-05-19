const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const isLoggedIn = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/adminMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/admin", isLoggedIn, isAdmin, asyncHandler(adminController.getDashboard));
router.post("/admin/rooms/:roomId/delete", isLoggedIn, isAdmin, asyncHandler(adminController.deleteRoom));
router.post("/admin/users/:userId/ban", isLoggedIn, isAdmin, asyncHandler(adminController.banUser));

module.exports = router;
