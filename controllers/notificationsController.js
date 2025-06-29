const Notification = require("../models/Notification");
const Users = require("../models/Users");

const notificationsController = {
  /// GET
  // Fonction pour compter le nombre total de notifications non lues d'un utilisateur
  countUnreadNotificationByUser: async (req, res) => {
    const { userId } = req.params; // Utilisation de req.params pour récupérer userId du chemin de l'URL
    try {
      const count = await Notification.count({
        where: {
          recipient_id: userId,
          read_notification: false,
        },
      });
      res.json({ count });
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  // Fonction pour récupérer toutes les notifications d'un utilisateur (dashboard utilisateur)
  getUserNotifications: async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await Notification.findAll({
        where: { recipient_id: userId },
        order: [["created_at", "DESC"]], // Assurez-vous de commander les notifications par date de création
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).send(error.message);
    }
  },

  /// POST
  // Fonction pour envoyer une notification
  sendNotification: async (req, res) => {
    const { message, recipient_id } = req.body; // Récupération des données de la requête
    try {
      // Création de la notification dans la base de données
      await Notification.create({
        message: message,
        recipient_id: recipient_id,
        created_at: new Date(), // Ou utilisez `Date.now()`
      });
      // Envoi d'une réponse de succès
      res.status(201).json({ message: "Notification envoyée avec succès." });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification", error);
      res
        .status(500)
        .json({ message: "Erreur lors de l'envoi de la notification" });
    }
  },

  // Fonction pour envoyer une notification à tous les administrateurs (utilisateurs dont le role_id est 1)
  sendNotificationAdmin: async (req, res) => {
    const { message } = req.body;

    // Vérifie que le message est une chaîne de caractères
    if (typeof message !== "string") {
      return res
        .status(400)
        .json({ message: "Le format du message est invalide." });
    }

    try {
      // Récupère tous les administrateurs
      const admins = await Users.findAll({
        where: { role_id: 1 },
        attributes: ["id"],
      });

      // Vérifie s'il y a des administrateurs
      if (!admins || admins.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun administrateur trouvé." });
      }

      // Envoie une notification à chaque administrateur
      for (const admin of admins) {
        await Notification.create({
          message: message,
          recipient_id: admin.id,
          // created_at: new Date(), // Cette ligne peut être omise si les timestamps sont gérés automatiquement
        });
      }

      res.status(201).json({ message: "Notifications envoyées avec succès." });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification", error);
      res
        .status(500)
        .json({ message: "Erreur lors de l'envoi des notifications." });
    }
  },

  // Fonction pour envoyer une notification à tous les adminstrateurs et enseignants (utilisateurs dont le role_id est 1 et 3)
  sendNotificationAllAdminsAndTeachers: async (req, res) => {
    const { message } = req.body;

    // Vérifie que le message est une chaîne de caractères
    if (typeof message !== "string") {
      return res
        .status(400)
        .json({ message: "Le format du message est invalide." });
    }

    try {
      const users = await Users.findAll({
        where: { role_id: [1, 3] },
        attributes: ["id"],
      });

      if (!users.length) {
        return res
          .status(404)
          .json({ message: "Aucun administrateur ou enseignant trouvé." });
      }

      const notifications = users.map((user) => ({
        message: message,
        recipient_id: user.id,
      }));

      await Notification.bulkCreate(notifications);

      res.status(201).json({ message: "Notification envoyée avec succès." });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification", error);
      res

        .status(500)

        .json({ message: "Erreur lors de l'envoi de la notification." });
    }
  },

  /// PATCH
  // Fonction pour basculer la lecture d'une notification (dashboard utilisateur)
  toggleReadNotification: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification non trouvée" });
      }
      notification.read_notification = !notification.read_notification;
      await notification.save();
      res.json(notification);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  // Fonction pour basculer la lecture de toutes les notifications d'un coup (dashboard utilisateur)
  toggleAllReadNotification: async (req, res) => {
    try {
      const { userId } = req.params;
      await Notification.update(
        { read_notification: true },
        { where: { recipient_id: userId } }
      );
      res.json({
        message: "Toutes les notifications ont été marquées comme lues",
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  /// DELETE
  // Fonction pour supprimer une notification par son id (dashboard utilisateur)
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification non trouvée" });
      }
      await notification.destroy();
      res.json({ message: "Notification supprimée avec succès" });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  /////////////////////////////////////////////////////////////////////////

  addNotification: async (req, res) => {
    try {
      const { recipient_id, message } = req.body;
      const notification = await Notification.create({ recipient_id, message });
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  countNotifications: async (req, res) => {
    try {
      const { userId } = req.params;
      const count = await Notification.count({
        where: { recipient_id: userId },
        // Ajoutez d'autres critères ici, par exemple pour filtrer par notifications non lues
      });
      res.json({ count });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },



  // Ajoutez ici d'autres contrôleurs de notification si nécessaire
};

module.exports = notificationsController;
