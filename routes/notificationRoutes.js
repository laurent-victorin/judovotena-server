const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationsController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Route pour compter le nombre total de notifications non lues d'un utilisateur
router.get(
  "/api/notifications/countUnreadNotificationUser/:userId",
  cw(notificationsController.countUnreadNotificationByUser)
);

// Route pour récupérer toutes les notifications d'un utilisateur
router.get(
  "/api/notifications/:userId",
  cw(notificationsController.getUserNotifications)
);

/// POST
// Route pour envoyer une notification
router.post(
  "/api/notifications/sendNotification",
  cw(notificationsController.sendNotification)
);

// Route pour envoyer une notification à l'administrateur
router.post(
  "/api/notifications/sendNotificationAdmin",
  cw(notificationsController.sendNotificationAdmin)
);

// Route pour envoyer une notification à tous les administrateurs et enseignants
router.post(
  "/api/notifications/sendNotificationAllAdminsAndTeachers",
  cw(notificationsController.sendNotificationAllAdminsAndTeachers)
);

// PATCH
//Route pour Toggle la lecture d'une notification
router.patch(
  "/api/notifications/toggleRead/:id",
  cw(notificationsController.toggleReadNotification)
);

// Route pour Toggle la lecture de toutes les notifications d'un coup
router.patch(
  "/api/notifications/toggleAllRead/:userId",
  cw(notificationsController.toggleAllReadNotification)
);

/// DELETE
// Route pour suppression d'une notification par son id
router.delete(
  "/api/notifications/:id",
  cw(notificationsController.deleteNotification)
);

////////////////////////////////////////////////////////////////////////

// Route pour récupérer toutes les notifications d'un utilisateur
router.get(
  "/api/notifications/:userId",
  cw(notificationsController.getUserNotifications)
);

// Route pour ajouter une nouvelle notification
router.post("/api/notifications", cw(notificationsController.addNotification));

// Exemple d'ajout dans un fichier de routes existant
router.get(
  "/api/notifications/count/:userId",
  cw(notificationsController.countNotifications)
);

// Route pour envoyer une notification
router.post(
  "/api/notifications/send",
  cw(notificationsController.sendNotification)
);

module.exports = router;
