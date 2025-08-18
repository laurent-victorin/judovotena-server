const express = require("express");
const router = express.Router();
const techniqueController = require("../controllers/techniqueController");
const cw = require("../controllers/controllerWrapper");

/// GET
router.get("/api/techniques/allTechniques", cw(techniqueController.getAllTechniques));

// Route pour afficher les techniques judo uniquement sans les familles : Kata, Vocabulaire, Les Bases, Ukemi
router.get(
  "/api/techniques/techniques-judo",
  cw(techniqueController.getJudoTechniques)
);

// Route pour afficher les techniques judo uniquement sans les familles : Kata, Vocabulaire, Les Bases, Ukemi et Self-Défense
router.get(
  "/api/techniques/techniques-judo-without-self-defense",
  cw(techniqueController.getJudoTechniquesWithoutSelfDefense)
);


// Route pour afficher uniquement les techniques qui font parti de l'UV2
router.get(
  "/api/techniques/techniques-uv2",
  cw(techniqueController.getUV2Techniques)
);

// Route pour afficher uniquement les techniques de la famille Kata
router.get(
  "/api/techniques/techniques-kata",
  cw(techniqueController.getKataTechniques)
);

/// POST
router.post("/api/techniques/addTechnique", cw(techniqueController.addTechnique));

/// PUT
router.put("/api/techniques/updateTechnique/:id", cw(techniqueController.updateTechnique));

/// DELETE
router.delete("/api/techniques/deleteTechnique/:id", cw(techniqueController.deleteTechnique));

module.exports = router;


