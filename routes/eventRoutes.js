const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const cw = require("../controllers/controllerWrapper");
const { upload, memoryUpload } = require("../services/multer-config");

/// GET
// Route pour afficher tous les événements
router.get("/api/events/allevents", cw(eventController.getAllEvents));

/// POST
// Route pour créer un événement
router.post("/api/events/createevents", cw(eventController.createEvent));

// Nouvelle route pour uploader un fichier d'événements
router.post(
  "/api/events/upload-events",
  memoryUpload.single("eventsFile"),
  eventController.uploadEvents
);

/// PUT
// Route pour éditer un événement
router.put("/api/events/editevents/:id", cw(eventController.editEvent));

/// Route pour toggle is_active d'un événement
router.put("/api/events/activeevents/:id", cw(eventController.activeEvent));

// Route pour modifier la photo d'un événement
router.patch(
  "/api/events/:id/photo",
  upload("/LIGUENA/events").single("image"),
  cw(eventController.updateEventPhoto)
);

/// DELETE
// Route pour supprimer un événement
router.delete("/api/events/deleteevents/:id", cw(eventController.deleteEvent));


module.exports = router;
