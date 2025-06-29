const express = require("express");
const settingsController = require("../controllers/settingsController");
const router = express.Router();
const cw = require("../controllers/controllerWrapper");
const { upload } = require("../services/multer-config");

/// GET
// Route pour obtenir les paramètres de l'application
router.get("/api/settings/getSettings", cw(settingsController.getSettings));

/// PUT
// Route pour mettre à jour les paramètres de l'application
router.put(
  "/api/settings/updateSettings",
  cw(settingsController.updateSettings)
);

/// PATCH
// Route pour mettre à jour l'image par défaut du règlement de Licence-Cotisation
router.patch(
  "/api/settings/updateDefaultImageLicence",
  upload("/JUDOCOACHPRO/settings").single("defaultImageLicence"), // Nom du champ de fichier doit être "defaultImageLicence"
  cw(settingsController.updateDefaultImageLicence)
);

// Route pour mettre à jour le logo du club
router.patch(
  "/api/settings/updateLogoClub",
  upload("/JUDOCOACHPRO/settings").single("logoClub"),
  cw(settingsController.updateLogoClub)
);

// Route pour mettre à jour l'image header_url1
router.patch(
  "/api/settings/updateFirstHeaderImage",
  upload("/JUDOCOACHPRO/settings").single("firstHeaderImage"),
  cw(settingsController.updateFirstHeaderImage)
);

// Route pour mettre à jour l'image header_url2
router.patch(
  "/api/settings/updateSecondHeaderImage",
  upload("/JUDOCOACHPRO/settings").single("secondHeaderImage"),
  cw(settingsController.updateSecondHeaderImage)
);

// Route pour mettre à jour l'image header
router.patch(
  "/api/settings/updateReglementHeaderImage",
  upload("/JUDOCOACHPRO/settings").single("reglementHeaderImage"),
  cw(settingsController.updateReglementHeaderImage)
);

// Route pour mettre à jour la première image facultative
router.patch(
  "/api/settings/updateReglementFirstImage",
  upload("/JUDOCOACHPRO/settings").single("reglementFirstImage"),
  cw(settingsController.updateReglementFirstImage)
);

// Route pour mettre à jour la deuxième image facultative
router.patch(
  "/api/settings/updateReglementSecondImage",
  upload("/JUDOCOACHPRO/settings").single("reglementSecondImage"),
  cw(settingsController.updateReglementSecondImage)
);

module.exports = router;
