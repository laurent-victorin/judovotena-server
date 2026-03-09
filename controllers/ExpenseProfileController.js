// controllers/ExpenseProfileController.js
const UserExpenseProfile = require("../models/UserExpenseProfile");
const Users = require("../models/Users");

const ExpenseProfileController = {
  // GET /api/users/:userId/expense-profile
  getByUser: async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      const profile = await UserExpenseProfile.findOne({
        where: { user_id: userId },
      });

      return res.json(profile || null);
    } catch (error) {
      console.error("ExpenseProfileController.getByUser error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // POST /api/users/:userId/expense-profile  (upsert)
  upsertByUser: async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      // (optionnel) vérifier user existe
      const user = await Users.findByPk(userId);
      if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

      const nil = (v) =>
        typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v;

      const payload = {
        user_id: userId,
        nom: nil(req.body.nom),
        prenom: nil(req.body.prenom),
        adresse: nil(req.body.adresse),
        cp: nil(req.body.cp),
        ville: nil(req.body.ville),
        fonction: nil(req.body.fonction),
        telephone: nil(req.body.telephone),
        email: nil(req.body.email),
        updated_at: new Date(),
      };

      // champs requis
      const required = ["nom", "prenom", "adresse", "cp", "ville"];
      for (const f of required) {
        if (!payload[f]) {
          return res.status(400).json({ message: `Champ requis manquant: ${f}` });
        }
      }

      const existing = await UserExpenseProfile.findOne({ where: { user_id: userId } });

      if (existing) {
        await existing.update(payload);
        return res.json(existing);
      }

      payload.created_at = new Date();
      const created = await UserExpenseProfile.create(payload);
      return res.status(201).json(created);
    } catch (error) {
      console.error("ExpenseProfileController.upsertByUser error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // DELETE /api/users/:userId/expense-profile
  deleteByUser: async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      await UserExpenseProfile.destroy({ where: { user_id: userId } });
      return res.json({ ok: true });
    } catch (error) {
      console.error("ExpenseProfileController.deleteByUser error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },
};

module.exports = ExpenseProfileController;
