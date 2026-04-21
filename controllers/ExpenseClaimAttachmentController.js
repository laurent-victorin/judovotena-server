// controllers/ExpenseClaimAttachmentController.js
const ExpenseClaim = require("../models/ExpenseClaim");
const ExpenseClaimItem = require("../models/ExpenseClaimItem");
const ExpenseClaimAttachment = require("../models/ExpenseClaimAttachment");

const ExpenseClaimAttachmentController = {
  // GET /api/expense/claims/:claimId/attachments
  getByClaim: async (req, res) => {
    try {
      const claimId = Number(req.params.claimId);

      const rows = await ExpenseClaimAttachment.findAll({
        where: { expense_claim_id: claimId },
        order: [["id", "DESC"]],
      });

      return res.json(rows);
    } catch (error) {
      console.error(
        "ExpenseClaimAttachmentController.getByClaim error:",
        error,
      );
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // POST /api/expense/claims/:claimId/attachments
  uploadToClaim: async (req, res) => {
    try {
      const claimId = Number(req.params.claimId);

      const claim = await ExpenseClaim.findByPk(claimId);
      if (!claim) return res.status(404).json({ message: "Fiche introuvable" });
      if (!["draft", "submitted", "rejected"].includes(claim.statut)) {
        return res.status(400).json({
          message:
            "Upload impossible : seules les fiches brouillon, soumises ou rejetées sont modifiables.",
        });
      }

      // Cas 1 : multer -> req.file
      const file_url =
        (req.file?.filename
          ? `/uploads/expense_attachments/${req.file.filename}`
          : null) || req.body.file_url;

      if (!file_url) {
        return res.status(400).json({
          message: "Aucun fichier reçu (file_url ou req.file attendu)",
        });
      }

      const row = await ExpenseClaimAttachment.create({
        expense_claim_id: claimId,
        expense_claim_item_id: null,

        file_url: String(file_url),
        public_id: req.file?.filename || req.body.public_id || null,
        original_name: req.file?.originalname || req.body.original_name || null,
        mime_type: req.file?.mimetype || req.body.mime_type || null,
        size_bytes: req.file?.size || req.body.size_bytes || null,

        uploaded_by_user_id: req.body.uploaded_by_user_id
          ? Number(req.body.uploaded_by_user_id)
          : null,
        created_at: new Date(),
      });

      return res.status(201).json(row);
    } catch (error) {
      console.error(
        "ExpenseClaimAttachmentController.uploadToClaim error:",
        error,
      );
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // POST /api/expense/items/:itemId/attachments
  uploadToItem: async (req, res) => {
    try {
      const itemId = Number(req.params.itemId);

      const item = await ExpenseClaimItem.findByPk(itemId);
      if (!item) return res.status(404).json({ message: "Ligne introuvable" });

      const claim = await ExpenseClaim.findByPk(item.expense_claim_id);
      if (!claim) return res.status(404).json({ message: "Fiche introuvable" });
      if (!["draft", "submitted", "rejected"].includes(claim.statut)) {
        return res.status(400).json({
          message:
            "Upload impossible : seules les fiches brouillon, soumises ou rejetées sont modifiables.",
        });
      }

      const file_url =
        (req.file?.filename
          ? `/uploads/expense_attachments/${req.file.filename}`
          : null) || req.body.file_url;

      if (!file_url) {
        return res.status(400).json({
          message: "Aucun fichier reçu (file_url ou req.file attendu)",
        });
      }

      const row = await ExpenseClaimAttachment.create({
        expense_claim_id: item.expense_claim_id,
        expense_claim_item_id: itemId,

        file_url: String(file_url),
        public_id: req.file?.filename || req.body.public_id || null,
        original_name: req.file?.originalname || req.body.original_name || null,
        mime_type: req.file?.mimetype || req.body.mime_type || null,
        size_bytes: req.file?.size || req.body.size_bytes || null,

        uploaded_by_user_id: req.body.uploaded_by_user_id
          ? Number(req.body.uploaded_by_user_id)
          : null,
        created_at: new Date(),
      });

      return res.status(201).json(row);
    } catch (error) {
      console.error(
        "ExpenseClaimAttachmentController.uploadToItem error:",
        error,
      );
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // DELETE /api/expense/attachments/:id
  delete: async (req, res) => {
    try {
      const id = Number(req.params.id);

      const row = await ExpenseClaimAttachment.findByPk(id);
      if (!row) return res.status(404).json({ message: "Fichier introuvable" });

      // (optionnel) vérifier statut fiche
      const claim = await ExpenseClaim.findByPk(row.expense_claim_id);
      if (claim && !["draft", "submitted", "rejected"].includes(claim.statut)) {
        return res.status(400).json({
          message:
            "Suppression impossible : seules les fiches brouillon, soumises ou rejetées sont modifiables.",
        });
      }

      await row.destroy();
      return res.json({ ok: true });
    } catch (error) {
      console.error("ExpenseClaimAttachmentController.delete error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },
};

module.exports = ExpenseClaimAttachmentController;
