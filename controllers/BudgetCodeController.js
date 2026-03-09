// controllers/BudgetCodeController.js
const EventBudgetCode = require("../models/EventBudgetCode");
const { Op } = require("sequelize");

const BudgetCodeController = {
  // GET /api/expense/budget-codes
  getAll: async (req, res) => {
    try {
      const activeOnly = String(req.query.activeOnly || "").trim() === "1";

      const where = {};
      if (activeOnly) where.is_active = 1;

      const rows = await EventBudgetCode.findAll({
        where,
        order: [
          ["code", "ASC"],
          ["libelle", "ASC"],
        ],
      });

      return res.json(rows);
    } catch (error) {
      console.error("BudgetCodeController.getAll error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // GET /api/expense/budget-codes/:id
  getById: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const row = await EventBudgetCode.findByPk(id);
      if (!row) return res.status(404).json({ message: "Code budgétaire introuvable" });
      return res.json(row);
    } catch (error) {
      console.error("BudgetCodeController.getById error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // POST /api/expense/budget-codes
  create: async (req, res) => {
    try {
      const nil = (v) =>
        typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v;

      const code = nil(req.body.code);
      const libelle = nil(req.body.libelle);
      const is_active = req.body.is_active == null ? 1 : Number(!!req.body.is_active);

      if (!code || !libelle) {
        return res.status(400).json({ message: "code et libelle sont requis" });
      }

      // éviter doublon (unique sur code)
      const exists = await EventBudgetCode.findOne({ where: { code } });
      if (exists) return res.status(409).json({ message: "Ce code existe déjà" });

      const row = await EventBudgetCode.create({
        code,
        libelle,
        is_active,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return res.status(201).json(row);
    } catch (error) {
      console.error("BudgetCodeController.create error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // PUT /api/expense/budget-codes/:id
  update: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const row = await EventBudgetCode.findByPk(id);
      if (!row) return res.status(404).json({ message: "Code budgétaire introuvable" });

      const nil = (v) =>
        typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v;

      const code = nil(req.body.code);
      const libelle = nil(req.body.libelle);
      const is_active =
        req.body.is_active == null ? row.is_active : Number(!!req.body.is_active);

      if (!code || !libelle) {
        return res.status(400).json({ message: "code et libelle sont requis" });
      }

      // si code changé -> check unique
      if (code !== row.code) {
        const exists = await EventBudgetCode.findOne({
          where: { code, id: { [Op.ne]: id } },
        });
        if (exists) return res.status(409).json({ message: "Ce code existe déjà" });
      }

      await row.update({ code, libelle, is_active, updated_at: new Date() });
      return res.json(row);
    } catch (error) {
      console.error("BudgetCodeController.update error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // DELETE /api/expense/budget-codes/:id
  delete: async (req, res) => {
    try {
      const id = Number(req.params.id);
      const row = await EventBudgetCode.findByPk(id);
      if (!row) return res.status(404).json({ message: "Code budgétaire introuvable" });

      await row.destroy();
      return res.json({ ok: true });
    } catch (error) {
      console.error("BudgetCodeController.delete error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },
};

module.exports = BudgetCodeController;
