const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Route pour compter le nombre total de messages non lus d'un utilisateur
router.get(
  "/api/messages/countUnreadMessageUser/:userId",
  cw(messageController.getUnreadMessageCountByUser)
);

// Route pour récupérer tous les messages d'un utilisateur (dashboard utilisateur)
router.get(
  "/api/messages/allmessages/:userId",
  cw(messageController.getUserMessages)
);

// Route pour récupérer tous les messages envoyés par un utilisateur (Messagerie)
router.get(
  "/api/messages/sentmessages/:userId",
  cw(messageController.getUserSentMessages)
);

// Route pour récupérer tous les messages
router.get("/api/messages/allMessages", cw(messageController.getAllMessages));

/// POST
// Route pour créer un message
router.post("/api/messages/createMessage", cw(messageController.createMessage));

/// PATCH
// Route pour marquer un message comme lu
router.patch(
  "/api/messages/toggleRead/:id",
  cw(messageController.toggleReadMessage)
);

// Route pour marquer tous les messages comme lu
router.patch(
  "/api/messages/toggleAllRead/:userId",
  cw(messageController.toggleAllReadMessage)
);

/// DELETE
// Route pour supprimer un message par son id
router.delete(
  "/api/messages/deleteMessage/:id",
  cw(messageController.deleteMessage)
);

///////////////////////////////////////////////////////////////

router.get("/api/messages/count", cw(messageController.getMessageCount));

// Ajoutez d'autres routes pour la création, la mise à jour et la suppression des messages si nécessaire

module.exports = router;
