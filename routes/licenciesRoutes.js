// routes/licenciesRoutes.js
const express = require("express");
const router = express.Router();
const cw = require("../controllers/controllerWrapper");
const licenciesController = require("../controllers/licenciesController");

/// GET
router.get("/api/licencies/getAll", cw(licenciesController.getAll));
router.get("/api/licencies/getById/:id", cw(licenciesController.getById));
router.get(
  "/api/licencies/byLicence/:licence_number",
  cw(licenciesController.getByLicenceNumber)
);
// Endpoint de check pour le scan (code-barres)
router.get("/api/licencies/check", cw(licenciesController.check));

/// POST
router.post("/api/licencies/add", cw(licenciesController.add));

/// PUT
router.put("/api/licencies/update/:id", cw(licenciesController.update));

/// DELETE
router.delete("/api/licencies/delete/:id", cw(licenciesController.remove));

module.exports = router;
