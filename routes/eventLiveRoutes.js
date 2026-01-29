const express = require("express");
const router = express.Router();
const cw = require("../controllers/controllerWrapper");
const eventLiveController = require("../controllers/eventLiveController");

/**
 * =========================
 * PUBLIC
 * =========================
 */

// ✅ liste des compétitions qui ont une répartition (slots) et/ou un live (stream)
router.get(
  "/api/live-events/available",
  cw(eventLiveController.getAvailableEvents)
);

// ✅ event courant “cohérent” (choisit une compétition dispo)
router.get(
  "/api/live-events/current/hub",
  cw(eventLiveController.getCurrentLiveHub)
);

// Event précis
router.get(
  "/api/live-events/:eventId/hub",
  cw(eventLiveController.getLiveHub)
);

/**
 * =========================
 * ADMIN (déjà protégé chez toi)
 * =========================
 */
router.put(
  "/api/live-events/:eventId/mats/:matNumber/stream",
  cw(eventLiveController.upsertMatStream)
);

router.patch(
  "/api/live-events/:eventId/mats/:matNumber/stream/toggle",
  cw(eventLiveController.toggleMatStream)
);

router.delete(
  "/api/live-events/:eventId/mats/:matNumber/stream",
  cw(eventLiveController.deleteMatStream)
);

module.exports = router;
