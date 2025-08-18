const UsersTechniques = require("../models/UsersTechniques");
const errorController = require("./errorController");

const usertechniqueController = {
  /// GET
  // Fonction pour obtenir toutes les techniques favorites d'un utilisateur
  getUsersTechniques: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const usersTechniques = await UsersTechniques.findAll({
        where: { user_id: userId },
      });
      res.json(usersTechniques);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Fonction pour ajouter une technique favorite à un utilisateur
  addUserTechnique: async (req, res, next) => {
    try {
      const { user_id, technique_id } = req.body;
      console.log("Received in addUserTechnique:", { user_id, technique_id }); // Ajout de console.log
      if (!user_id || !technique_id) {
        throw new Error("user_id and technique_id are required");
      }
      await UsersTechniques.create({ user_id, technique_id });
      res.json({ message: "Technique ajoutée avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Fonction pour supprimer une technique favorite d'un utilisateur
  deleteUserTechnique: async (req, res, next) => {
    try {
      const { user_id, technique_id } = req.body;
      console.log("Received in deleteUserTechnique:", {
        user_id,
        technique_id,
      }); // Ajout de console.log
      if (!user_id || !technique_id) {
        throw new Error("user_id and technique_id are required");
      }
      await UsersTechniques.destroy({
        where: { user_id, technique_id },
      });
      res.json({ message: "Technique supprimée avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = usertechniqueController;
