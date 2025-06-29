const ContactForm = require("../models/ContactForm");

const contactformController = {
  /// GET
  // Fonction pour récupérer tous les messages de contact
  // Trier les plus récents en premier
  getAllMessagesContactForm: async (req, res) => {
    try {
      const messages = await ContactForm.findAll({
        order: [["created_at", "DESC"]],
      });
      res.json(messages);
    } catch (error) {
      console.error("Erreur lors de la récupération des messages", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des messages" });
    }
  },

  // Fonction pour récupérer le nombre de messages de contact non lus
  countUnreadMessagesContactForm: async (req, res) => {
    try {
      const count = await ContactForm.count({
        where: { read_message: false },
      });
      res.json({ count });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de messages non lus",
        error
      );
      res.status(500).json({
        message: "Erreur lors de la récupération du nombre de messages non lus",
      });
    }
  },

  /// POST
  // Fonction pour envoyer un message de contact
  sendMessageContactForm: async (req, res) => {
    const { name, email, message } = req.body;
    try {
      await ContactForm.create({
        name: name,
        email: email,
        message: message,
        created_at: new Date(),
      });
      res.status(201).json({ message: "Message envoyé avec succès." });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message", error);
      res.status(500).json({ message: "Erreur lors de l'envoi du message" });
    }
  },

  /// PATCH
  // Fonction pour basculer contacForm read (dashboard utilisateur)
  toggleReadContactForm: async (req, res) => {
    try {
      const { id } = req.params;
      const contactform = await ContactForm.findByPk(id);
      if (!contactform) {
        return res
          .status(404)
          .json({ message: "Message ContactForm non trouvé" });
      }
      contactform.read_message = !contactform.read_message;
      await contactform.save();
      res.json(contactform);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  // Fonction pour basculer la lecture de toutes les messages ContactForm d'un coup (dashboard utilisateur)
  toggleAllReadContactForm: async (req, res) => {
    try {
      await ContactForm.update({ read_message: true });
      res.json({
        message: "Toutes les messages ContactForm ont été marqués comme lus",
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  /// DELETE
  // Fonction pour supprimer un message de contact par son id
  deleteMessageContactForm: async (req, res) => {
    const id = req.params.id;
    try {
      const message = await ContactForm.findByPk(id);
      if (!message) {
        return res.status(404).json({ message: "Message non trouvé" });
      }
      await message.destroy();
      res.json({ message: "Message supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du message", error);
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression du message" });
    }
  },
};

module.exports = contactformController;
