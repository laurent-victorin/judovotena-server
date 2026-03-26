const express = require("express");
const reglementarbitrageController = require("../controllers/reglementarbitrageController");
const router = express.Router();
const cw = require("../controllers/controllerWrapper");

/// GET
router.get(
  "/api/reglementsarbitrage/allreglement",
  cw(reglementarbitrageController.getAllReglementsArbitrage)
);

/// POST
router.post(
  "/api/reglementsarbitrage/addreglement",
  cw(reglementarbitrageController.addReglementArbitrage)
);

/// PUT
router.put(
  "/api/reglementsarbitrage/updatereglement/:id",
  cw(reglementarbitrageController.updateReglementArbitrage)
);

/// PUT - reorder
router.put(
  "/api/reglementsarbitrage/reorder",
  cw(reglementarbitrageController.reorderReglementsArbitrage)
);

/// DELETE
router.delete(
  "/api/reglementsarbitrage/deletereglement/:id",
  cw(reglementarbitrageController.deleteReglementArbitrage)
);

module.exports = router;