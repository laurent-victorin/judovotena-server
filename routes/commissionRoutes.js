const express = require("express");
const router = express.Router();
const CommissionsController = require("../controllers/CommissionsController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Obtenir toutes les commissions
router.get("/api/commissions/allcommissions", cw(CommissionsController.getAllCommissions));

// Obtenir une commission par ID
router.get("/api/commissions/:id", cw(CommissionsController.getCommissionById));

// Compter le nombre total de commissions
router.get("/api/commissions/count", cw(CommissionsController.countCommissions));

/// POST
// Créer une commission
router.post("/api/commissions/create", cw(CommissionsController.createCommission));

/// PUT
// Mettre à jour une commission
router.put("/api/commissions/update/:id", cw(CommissionsController.updateCommission));

/// DELETE
// Supprimer une commission
router.delete("/api/commissions/delete/:id", cw(CommissionsController.deleteCommission));

module.exports = router;
