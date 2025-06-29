const express = require("express");
const { requireRole } = require("../middlewares/roleMiddleware");
const adminController = require("../controllers/adminController");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  requireRole("admin"),
  adminController.getAllUsers
);
router.post(
  "/update-role",
  authenticateToken,
  requireRole("admin"),
  adminController.updateUserRole
);

module.exports = router;
