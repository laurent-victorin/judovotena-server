const express = require("express");
const roleController = require("../controllers/roleController"); // Assurez-vous que le chemin est correct
const router = express.Router();
const cw = require("../controllers/controllerWrapper");

router.get("/api/users/roles", cw(roleController.getAllRoles));

module.exports = router;
