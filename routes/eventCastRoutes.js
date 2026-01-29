// routes/eventCastRoutes.js
const express = require("express");
const router = express.Router();
const castController = require("../controllers/eventCastController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Bundle complet pour la page Casting (tapis + slots + messages + state)
router.get("/api/events/:eventId/cast", cw(castController.getCastBundle));

// Messages
router.get(
  "/api/events/:eventId/cast/messages",
  cw(castController.getMessagesByEvent)
);

/// POST
router.post(
  "/api/events/:eventId/cast/messages/add",
  cw(castController.addMessage)
);

/// PUT
// Upsert d’un tapis + ses slots (remplacement complet des slots)
router.put(
  "/api/events/:eventId/cast/mats/:matNumber",
  cw(castController.upsertMatWithSlots)
);

// Ouvrir/fermer un tapis (toggle)
router.put(
  "/api/events/:eventId/cast/mats/:matNumber/toggle",
  cw(castController.toggleMatOpen)
);

// Mise à jour message
router.put(
  "/api/events/:eventId/cast/messages/update/:id",
  cw(castController.updateMessage)
);

// Toggle message actif/inactif
router.put(
  "/api/events/:eventId/cast/messages/toggle/:id",
  cw(castController.toggleMessageActive)
);

// State live (mode + message actif)
router.put(
  "/api/events/:eventId/cast/state",
  cw(castController.upsertCastState)
);

/// DELETE
router.delete(
  "/api/events/:eventId/cast/mats/:matNumber",
  cw(castController.deleteMat)
);

router.delete(
  "/api/events/:eventId/cast/messages/delete/:id",
  cw(castController.deleteMessage)
);

module.exports = router;
