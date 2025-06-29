const Role = require("../models/Role"); // Assurez-vous que le chemin est correct

const roleController = {
  getAllRoles: async (req, res) => {
    try {
      const roles = await Role.findAll();
      res.json(roles);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des rôles" });
    }
  },

};

module.exports = roleController;
