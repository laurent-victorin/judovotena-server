const express = require("express");
const router = express.Router();
const cw = require("../controllers/controllerWrapper");
const resultseventController = require("../controllers/resultsEventController");

/// GET
// Tous les résultats (paginer/filtrer côté contrôleur si besoin)
router.get("/api/results-events", cw(resultseventController.getAllResults));
// Un résultat par id
router.get("/api/results-events/:id", cw(resultseventController.getResultById));
// Tous les résultats rattachés à un event_id (pas de FK en DB)
router.get(
  "/api/events/:eventId/results",
  cw(resultseventController.getResultsByEventId)
);

/// POST
// Créer un ResultsEvent générique (si tu veux poster un objet complet)
router.post("/api/results-events", cw(resultseventController.create));
// Créer un ResultsEvent à partir d'un Event existant (copie titre, start, etc.)
router.post(
  "/api/events/:eventId/results",
  cw(resultseventController.createFromEvent)
);

/// PUT / PATCH
// Mettre à jour toutes les infos d'un ResultsEvent
router.put("/api/results-events/:id", cw(resultseventController.update));
// Mettre à jour uniquement les liens (rapport_url, tableaux_url, selection_url, photospodium_url)
router.patch(
  "/api/results-events/:id/links",
  cw(resultseventController.updateLinks)
);

/// DELETE
// Supprimer un ResultsEvent
router.delete("/api/results-events/:id", cw(resultseventController.remove));

module.exports = router;
