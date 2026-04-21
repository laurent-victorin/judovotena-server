// controllers/ExpenseClaimItemController.js
const ExpenseClaim = require("../models/ExpenseClaim");
const ExpenseClaimItem = require("../models/ExpenseClaimItem");
const sequelize = require("../database");

function numOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function recalcTotals(claimId, t) {
  const items = await ExpenseClaimItem.findAll({
    where: { expense_claim_id: claimId },
    attributes: ["montant"],
    transaction: t,
  });
  const itemsSum = items.reduce((acc, it) => acc + Number(it.montant || 0), 0);

  const claim = await ExpenseClaim.findByPk(claimId, { transaction: t });
  if (!claim) return;

  const trajet = Number(claim.montant_trajet || 0);
  const indTenue = Number(claim.indemnite_tenue || 0);
  const indRep = Number(claim.indemnite_representation || 0);

  const total_frais = Number(itemsSum.toFixed(2));
  const total_general = Number(
    (itemsSum + trajet + indTenue + indRep).toFixed(2),
  );

  await claim.update(
    { total_frais, total_general, updated_at: new Date() },
    { transaction: t },
  );
}

const ExpenseClaimItemController = {
  // GET /api/expense/claims/:claimId/items
  getByClaim: async (req, res) => {
    try {
      const claimId = Number(req.params.claimId);

      const rows = await ExpenseClaimItem.findAll({
        where: { expense_claim_id: claimId },
        order: [["id", "ASC"]],
      });

      return res.json(rows);
    } catch (error) {
      console.error("ExpenseClaimItemController.getByClaim error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // POST /api/expense/claims/:claimId/items
  create: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const claimId = Number(req.params.claimId);

      const claim = await ExpenseClaim.findByPk(claimId, { transaction: t });
      if (!claim) {
        await t.rollback();
        return res.status(404).json({ message: "Fiche introuvable" });
      }
      if (!["draft", "submitted", "rejected"].includes(claim.statut)) {
        await t.rollback();
        return res.status(400).json({
          message:
            "Ajout ligne impossible : seules les fiches brouillon, soumises ou rejetées sont modifiables.",
        });
      }

      const type = req.body.type;
      const montant = numOrNull(req.body.montant);

      if (!type || montant === null) {
        await t.rollback();
        return res.status(400).json({ message: "type et montant sont requis" });
      }

      const row = await ExpenseClaimItem.create(
        {
          expense_claim_id: claimId,
          type,
          date_frais: req.body.date_frais || null,
          montant,
          description: req.body.description || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction: t },
      );

      await recalcTotals(claimId, t);
      await t.commit();

      return res.status(201).json(row);
    } catch (error) {
      await t.rollback();
      console.error("ExpenseClaimItemController.create error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // PUT /api/expense/items/:id
  update: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const id = Number(req.params.id);

      const row = await ExpenseClaimItem.findByPk(id, { transaction: t });
      if (!row) {
        await t.rollback();
        return res.status(404).json({ message: "Ligne introuvable" });
      }

      const claim = await ExpenseClaim.findByPk(row.expense_claim_id, {
        transaction: t,
      });
      if (!claim) {
        await t.rollback();
        return res.status(404).json({ message: "Fiche introuvable" });
      }
      if (!["draft", "submitted", "rejected"].includes(claim.statut)) {
        await t.rollback();
        return res.status(400).json({
          message:
            "Modification ligne impossible : seules les fiches brouillon, soumises ou rejetées sont modifiables.",
        });
      }

      const payload = {
        type: req.body.type ?? row.type,
        date_frais: req.body.date_frais ?? row.date_frais,
        montant:
          req.body.montant == null
            ? row.montant
            : (numOrNull(req.body.montant) ?? row.montant),
        description: req.body.description ?? row.description,
        updated_at: new Date(),
      };

      await row.update(payload, { transaction: t });
      await recalcTotals(row.expense_claim_id, t);

      await t.commit();
      return res.json(row);
    } catch (error) {
      await t.rollback();
      console.error("ExpenseClaimItemController.update error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // DELETE /api/expense/items/:id
  delete: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const id = Number(req.params.id);

      const row = await ExpenseClaimItem.findByPk(id, { transaction: t });
      if (!row) {
        await t.rollback();
        return res.status(404).json({ message: "Ligne introuvable" });
      }

      const claim = await ExpenseClaim.findByPk(row.expense_claim_id, {
        transaction: t,
      });
      if (!claim) {
        await t.rollback();
        return res.status(404).json({ message: "Fiche introuvable" });
      }
      if (!["draft", "submitted", "rejected"].includes(claim.statut)) {
        await t.rollback();
        return res.status(400).json({
          message:
            "Suppression ligne impossible : seules les fiches brouillon, soumises ou rejetées sont modifiables.",
        });
      }

      const claimId = row.expense_claim_id;
      await row.destroy({ transaction: t });
      await recalcTotals(claimId, t);

      await t.commit();
      return res.json({ ok: true });
    } catch (error) {
      await t.rollback();
      console.error("ExpenseClaimItemController.delete error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },
};

module.exports = ExpenseClaimItemController;
