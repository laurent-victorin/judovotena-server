const Sequelize = require("sequelize");
const Message = require("../models/Message");
const Users = require("../models/Users");
const errorController = require("./errorController");
const { Op } = require("sequelize");

const messageController = {
  /// GET
  // Fonction pour compter le nombre total de messages d'un utilisateur non lus avec read_message = false
  getUnreadMessageCountByUser: async (req, res, next) => {
    const { userId } = req.params; // Utilisation de req.params pour récupérer userId du chemin de l'URL
    try {
      const count = await Message.count({
        where: {
          recipient_id: userId,
          read_message: false,
        },
      });
      res.json({ count });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour récupérer tous les messages destinés à l'utilisateur (dashboard utilisateur)
  getUserMessages: async (req, res, next) => {
    const { userId } = req.params;
    try {
      const messages = await Message.findAll({
        where: {
          recipient_id: userId,
        },
        include: [
          {
            model: Users,
            as: "Sender",
            attributes: ["nom", "prenom", "photoURL"],
          },
          { model: Users, as: "Recipient", attributes: ["nom", "prenom"] },
        ],
        order: [["created_at", "DESC"]],
      });
      res.json(messages);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour récupérer tous les messages envoyés par l'utilisateur (Messagerie)
  getUserSentMessages: async (req, res, next) => {
    const { userId } = req.params;
    try {
      const messages = await Message.findAll({
        where: {
          sender_id: userId,
        },
        include: [
          { model: Users, as: "Sender", attributes: ["nom", "prenom"] },
          { model: Users, as: "Recipient", attributes: ["nom", "prenom"] },
        ],
        order: [["created_at", "DESC"]],
      });
      res.json(messages);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour récupérer tous les messages, il faut nom et prenom du Sender et du Recipient (Messagerie) et dans l'ordre décroissant
  getAllMessages: async (req, res, next) => {
    try {
      const messages = await Message.findAll({
        include: [
          { model: Users, as: "Sender", attributes: ["nom", "prenom"] },
          { model: Users, as: "Recipient", attributes: ["nom", "prenom"] },
        ],
        order: [["created_at", "DESC"]],
      });
      res.json(messages);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Fonction pour créer un message
  createMessage: async (req, res, next) => {
    try {
      const { sender_id, recipient_id, subject, content } = req.body;
      const recipientIdNum = parseInt(recipient_id, 10);

      if (isNaN(recipientIdNum)) {
        return res.status(400).json({ message: "recipient_id invalide" });
      }

      // Création du message pour le destinataire
      const newRecipientMessage = await Message.create({
        sender_id,
        recipient_id: recipientIdNum,
        subject,
        content,
        read_message: false,
        is_copy: false, // Message original
      });

      res.status(201).json({
        recipientMessage: newRecipientMessage,
      });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },


  /// PATCH
  // Fonction pour marquer un message comme lu (dashboard utilisateur)
  toggleReadMessage: async (req, res, next) => {
    try {
      const { id } = req.params;
      const message = await Message.findByPk(id);

      if (!message) {
        return res.status(404).json({ message: "Message non trouvé" });
      }

      message.read_message = !message.read_message;
      await message.save();
      res.json(message);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour marquer tous les messages comme lus (dashboard utilisateur)
  toggleAllReadMessage: async (req, res, next) => {
    const { userId } = req.params;
    try {
      await Message.update(
        { read_message: true },
        {
          where: {
            recipient_id: userId,
          },
        }
      );
      res.json({ message: "Tous les messages ont été marqués comme lus" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Fonction pour supprimer un message par son id (dashboard utilisateur)
  deleteMessage: async (req, res, next) => {
    try {
      const { id } = req.params;
      const message = await Message.findByPk(id);

      if (!message) {
        return res.status(404).json({ message: "Message non trouvé" });
      }

      await message.destroy();
      res.json({ message: "Message supprimé avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  ///////////////////////////////////////////////////////////////////////////

  getMessageCount: async (req, res, next) => {
    const { userId } = req.query;

    try {
      const count = await Message.count({
        where: {
          recipient_id: userId,
          // Ajoutez d'autres conditions si nécessaire
        },
      });
      res.json({ count });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Ajoutez ici des méthodes pour la création, la mise à jour et la suppression des messages si nécessaire
};

module.exports = messageController;
