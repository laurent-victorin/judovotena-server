const express = require("express");
const router = express.Router();
const userseventsController = require("../controllers/userseventsController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Route pour obtenir tous les événements favorites d'un utilisateur
router.get(
  "/api/usersEvents/:userId",
  cw(userseventsController.getUsersEvents)
);

module.exports = router;

/// POST
// Route pour ajouter un événement favori à un utilisateur
router.post("/api/usersEvents/add", cw(userseventsController.addUserEvent));

/// DELETE
// Route pour supprimer un événement favori d'un utilisateur
router.delete(
  "/api/usersEvents/delete",
  cw(userseventsController.deleteUserEvent)
);

module.exports = router;
