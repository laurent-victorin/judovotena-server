const Commissions = require("../models/Commissions");
const TeamLigue = require("../models/TeamLigue");
const ArticlesCommissions = require("../models/ArticlesCommissions");

const CommissionsController = {
  /// GET
  // Obtenir toutes les commissions avec leurs membres et articles associés
  getAllCommissions: async (req, res) => {
    try {
      const commissions = await Commissions.findAll({
        include: [
          {
            model: TeamLigue,
            as: "members",
          },
          {
            model: ArticlesCommissions,
            as: "articles",
          },
        ],
        order: [["id", "ASC"]],
      });
      res.status(200).json(commissions);
    } catch (error) {
      console.error("❌ Erreur getAllCommissions :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Obtenir une commission par ID
  getCommissionById: async (req, res) => {
    try {
      const commission = await Commissions.findByPk(req.params.id, {
        include: [
          { model: TeamLigue, as: "members" },
          { model: ArticlesCommissions, as: "articles" },
        ],
      });

      if (!commission) {
        return res.status(404).json({ message: "Commission non trouvée" });
      }

      res.status(200).json(commission);
    } catch (error) {
      console.error("❌ Erreur getCommissionById :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Compter les commissions
  countCommissions: async (req, res) => {
    try {
      const totalCommissions = await Commissions.count();
      res.status(200).json({ totalCommissions });
    } catch (error) {
      console.error("❌ Erreur countCommissions :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  /// POST
  // Créer une commission
  createCommission: async (req, res) => {
    try {
      const { nom_commission, description_commission, photo_url } = req.body;

      if (!nom_commission || !photo_url) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
      }

      const newCommission = await Commissions.create({
        nom_commission,
        description_commission,
        photo_url,
      });

      res.status(201).json(newCommission);
    } catch (error) {
      console.error("❌ Erreur createCommission :", error);
      res.status(500).json({ message: "Erreur lors de la création", error });
    }
  },

  /// PUT
  // Mettre à jour une commission
  updateCommission: async (req, res) => {
    try {
      const commission = await Commissions.findByPk(req.params.id);

      if (!commission) {
        return res.status(404).json({ message: "Commission non trouvée" });
      }

      await commission.update(req.body);
      res.status(200).json(commission);
    } catch (error) {
      console.error("❌ Erreur updateCommission :", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour", error });
    }
  },

  /// DELETE
  // Supprimer une commission
  deleteCommission: async (req, res) => {
    try {
      const commission = await Commissions.findByPk(req.params.id);

      if (!commission) {
        return res.status(404).json({ message: "Commission non trouvée" });
      }

      await commission.destroy();
      res.status(200).json({ message: "Commission supprimée avec succès" });
    } catch (error) {
      console.error("❌ Erreur deleteCommission :", error);
      res.status(500).json({ message: "Erreur lors de la suppression", error });
    }
  },
};

module.exports = CommissionsController;
