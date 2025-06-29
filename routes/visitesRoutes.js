const express = require("express");
const router = express.Router();
const visiteController = require("../controllers/visiteController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Route pour compter le nombre de visites
router.get("/api/visites/countVisites", cw(visiteController.countVisites));

// Rote pour compter les visites par date
router.get(
  "/api/visites/countVisitesByDate",
  cw(visiteController.countVisitesByDate)
);

/// POST
// Route pour ajouter une visite
router.post("/api/visites/addVisite", cw(visiteController.addVisite));

module.exports = router;
