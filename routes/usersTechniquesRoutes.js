const express = require("express");
const router = express.Router();
const usertechniqueController = require("../controllers/usertechniqueController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Route pour obtenir toutes les techniques favorites d'un utilisateur
router.get(
  "/api/usersTechniques/:userId",
  cw(usertechniqueController.getUsersTechniques)
);

module.exports = router;


/// POST
// Route pour ajouter une technique favorite à un utilisateur
router.post(
  "/api/usersTechniques/add",
  cw(usertechniqueController.addUserTechnique)
);

/// DELETE
// Route pour supprimer une technique favorite d'un utilisateur
router.delete(
  "/api/usersTechniques/delete",
  cw(usertechniqueController.deleteUserTechnique)
);

module.exports = router;