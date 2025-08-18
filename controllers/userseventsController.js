const UsersEvents = require("../models/UsersEvents");
const errorController = require("./errorController");

const userseventsController = {
  /// GET
  // Fonction pour obtenir tous les événements favoris d'un utilisateur
  getUsersEvents: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const usersEvents = await UsersEvents.findAll({
        where: { user_id: userId },
      });
      res.json(usersEvents);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Fonction pour ajouter un événement favori à un utilisateur
  addUserEvent: async (req, res, next) => {
    try {
      const { user_id, event_id } = req.body;
      console.log("Received in addUserEvent:", { user_id, event_id }); // Ajout de console.log
      if (!user_id || !event_id) {
        throw new Error("user_id and event_id are required");
      }
      await UsersEvents.create({ user_id, event_id });
      res.json({ message: "Événement ajouté avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Fonction pour supprimer un événement favori d'un utilisateur
  deleteUserEvent: async (req, res, next) => {
    try {
      const { user_id, event_id } = req.body;
      console.log("Received in deleteUserEvent:", {
        user_id,
        event_id,
      }); // Ajout de console.log
      if (!user_id || !event_id) {
        throw new Error("user_id and event_id are required");
      }
      await UsersEvents.destroy({
        where: { user_id, event_id },
      });
      res.json({ message: "Événement supprimé avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

};

module.exports = userseventsController;