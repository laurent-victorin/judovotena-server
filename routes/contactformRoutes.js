// Routes pour les formulaires de contact
const express = require("express");
const router = express.Router();
const contactformController = require("../controllers/contactformController");
const cw = require("../controllers/controllerWrapper");

///GET
// Route pour récupérer tous les messages de contact
router.get(
  "/api/contactform/AllMessagesContactForm",
  cw(contactformController.getAllMessagesContactForm)
);

// Route pour récupérer le nombre de messages de contact non lus
router.get(
  "/api/contactform/countUnreadMessagesContactForm",
  cw(contactformController.countUnreadMessagesContactForm)
);

///POST
// Route pour envoyer un message de contact
router.post(
  "/api/contactform/sendMessageContactForm",
  cw(contactformController.sendMessageContactForm)
);

///PATCH
// Route pour basculer la lecture d'un message de contact
router.patch(
  "/api/contactform/toggleReadContactForm/:id",
  cw(contactformController.toggleReadContactForm)
);

// Route pour basculer la lecture de tous les messages de contact d'un coup
router.patch(
  "/api/contactform/toggleAllReadContactForm",
  cw(contactformController.toggleAllReadContactForm)
);

/// DELETE
// Route pour supprimer un message de contact par son id
router.delete(
  "/api/contactform/deleteMessageContactForm/:id",
  cw(contactformController.deleteMessageContactForm)
);

module.exports = router;
