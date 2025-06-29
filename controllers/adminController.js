const Users = require("../models/Users"); // Assurez-vous d'avoir ce modèle d'utilisateur ou un modèle similaire

const adminController = {
  // Obtenir la liste des utilisateurs
  getAllUsers: async (req, res) => {
    try {
      const users = await Users.findAll();
      res.json(users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      res.status(500).send("Erreur serveur");
    }
  },

  // Modifier le rôle d'un utilisateur
  updateUserRole: async (req, res) => {
    const { userId, newRole } = req.body; // Assurez-vous que le corps de la requête contient ces informations
    try {
      const user = await Users.findByPk(userId);
      if (user) {
        await user.update({ role: newRole });
        res.send("Rôle utilisateur mis à jour avec succès");
      } else {
        res.status(404).send("Utilisateur non trouvé");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du rôle de l'utilisateur:",
        error
      );
      res.status(500).send("Erreur serveur");
    }
  },

  // Ajoutez d'autres actions administratives ici...
};

module.exports = adminController;
