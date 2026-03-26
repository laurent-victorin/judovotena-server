const express = require("express");
const router = express.Router();
const acteurEventController = require("../controllers/acteurEventController");
const cw = require("../controllers/controllerWrapper");
const authenticateToken = require("../middlewares/authenticateToken");

/// GET
// Route pour obtenir tous les résultats
router.get(
  "/api/acteursevents/allresults",
  cw(acteurEventController.getAllResults),
);

// Route pour obtenir la liste des acteurs ayant participé à un événement
router.get(
  "/api/acteursevents/getActeursByEventId/:eventId",
  cw(acteurEventController.getActeursByEventId),
);

// Route pour obtenir la liste des événements auxquels un acteur a participé
router.get(
  "/api/acteursevents/getEventsByActeurId/:acteurId",
  cw(acteurEventController.getEventsByActeurId),
);

// NOUVEAU : récupérer les convocations de l'acteur lié à l'utilisateur connecté
router.get(
  "/api/acteursevents/myConvocations",
  cw(acteurEventController.getMyConvocations),
);

/// POST
// Route pour ajouter un acteur à un événement
router.post(
  "/api/acteursevents/assignActorToEvent",
  cw(acteurEventController.assignActorToEvent),
);

/// PUT
// Route pour mettre à jour un acteur dans un événement
router.put(
  "/api/acteursevents/updateActeurInEvent/:acteurId/:eventId",
  cw(acteurEventController.updateActeurInEvent),
);

// Route pour toggle la validation d'un acteur dans un événement
router.put(
  "/api/acteursevents/toggleValidation/:acteurId/:eventId",
  cw(acteurEventController.toggleValidation),
);

// NOUVEAU : répondre à une convocation
router.put(
  "/api/acteursevents/respondToConvocation/:eventId",
  authenticateToken,
  cw(acteurEventController.respondToConvocation),
);

/// DELETE
// Route pour supprimer un acteur d'un événement
router.delete(
  "/api/acteursevents/removeActeurFromEvent/:acteurId/:eventId",
  cw(acteurEventController.removeActeurFromEvent),
);

module.exports = router;
