const express = require("express");
const reglementarbitrageController = require("../controllers/reglementarbitrageController"); // Assurez-vous que le chemin est correct
const router = express.Router();
const cw = require("../controllers/controllerWrapper");

/// GET
router.get("/api/reglementsarbitrage/allreglement", cw(reglementarbitrageController.getAllReglementsArbitrage));

/// POST
router.post("/api/reglementsarbitrage/addreglement", cw(reglementarbitrageController.addReglementArbitrage));

/// PUT
router.put("/api/reglementsarbitrage/updatereglement/:id", cw(reglementarbitrageController.updateReglementArbitrage));

/// DELETE
router.delete("/api/reglementsarbitrage/deletereglement/:id", cw(reglementarbitrageController.deleteReglementArbitrage));

module.exports = router;