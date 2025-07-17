const TeamLigue = require("../models/TeamLigue");
const Commissions = require("../models/Commissions");

const TeamLigueController = {
  // Obtenir tous les membres de la ligue avec leur commission
  getAllTeamLigue: async (req, res) => {
    try {
      const team = await TeamLigue.findAll({
        include: [{ model: Commissions, as: "commission" }],
        order: [["ordre", "ASC"]],
      });
      res.status(200).json(team);
    } catch (error) {
      console.error("❌ Erreur getAllTeamLigue :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Obtenir un membre par ID
  getTeamMemberById: async (req, res) => {
    try {
      const member = await TeamLigue.findByPk(req.params.id, {
        include: [{ model: Commissions, as: "commission" }],
      });

      if (!member) {
        return res.status(404).json({ message: "Membre non trouvé" });
      }

      res.status(200).json(member);
    } catch (error) {
      console.error("❌ Erreur getTeamMemberById :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Obtenir tous les membres d'une commission
  getTeamByCommission: async (req, res) => {
    try {
      const members = await TeamLigue.findAll({
        where: { commission_id: req.params.commission_id },
        include: [{ model: Commissions, as: "commission" }],
        order: [["ordre", "ASC"]],
      });

      res.status(200).json(members);
    } catch (error) {
      console.error("❌ Erreur getTeamByCommission :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Compter les membres
  countTeamMembers: async (req, res) => {
    try {
      const total = await TeamLigue.count();
      res.status(200).json({ total });
    } catch (error) {
      console.error("❌ Erreur countTeamMembers :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Créer un membre
  createTeamMember: async (req, res) => {
    try {
      const { nom, prenom, poste, email, photo_url, commission_id, ordre } = req.body;

      if (!nom || !prenom || !poste || ordre === undefined) {
        return res.status(400).json({ message: "Champs requis manquants" });
      }

      const newMember = await TeamLigue.create({
        nom,
        prenom,
        poste,
        email,
        photo_url,
        commission_id,
        ordre,
      });

      res.status(201).json(newMember);
    } catch (error) {
      console.error("❌ Erreur createTeamMember :", error);
      res.status(500).json({ message: "Erreur lors de la création", error });
    }
  },

  // Mettre à jour un membre
  updateTeamMember: async (req, res) => {
    try {
      const member = await TeamLigue.findByPk(req.params.id);

      if (!member) {
        return res.status(404).json({ message: "Membre non trouvé" });
      }

      await member.update(req.body);
      res.status(200).json(member);
    } catch (error) {
      console.error("❌ Erreur updateTeamMember :", error);
      res.status(500).json({ message: "Erreur mise à jour", error });
    }
  },

  // Supprimer un membre
  deleteTeamMember: async (req, res) => {
    try {
      const member = await TeamLigue.findByPk(req.params.id);

      if (!member) {
        return res.status(404).json({ message: "Membre non trouvé" });
      }

      await member.destroy();
      res.status(200).json({ message: "Membre supprimé avec succès" });
    } catch (error) {
      console.error("❌ Erreur deleteTeamMember :", error);
      res.status(500).json({ message: "Erreur suppression", error });
    }
  },
};

module.exports = TeamLigueController;
