const express = require("express");
const router = express.Router();

const cw = require("../controllers/controllerWrapper");

const ExpenseProfileController = require("../controllers/ExpenseProfileController");
const BudgetCodeController = require("../controllers/BudgetCodeController");
const ExpenseClaimController = require("../controllers/ExpenseClaimController");
const ExpenseClaimItemController = require("../controllers/ExpenseClaimItemController");
const ExpenseClaimAttachmentController = require("../controllers/ExpenseClaimAttachmentController");
const { uploadExpenseAttachment } = require("../services/multer-config");

/* ======================================================================
   ✅ PROFIL FRAIS (coordonnées pré-remplies)
   ====================================================================== */

// Récupérer le profil frais d’un user
router.get("/api/users/:userId/expense-profile", cw(ExpenseProfileController.getByUser));

// Créer / mettre à jour (upsert) le profil frais d’un user
router.post("/api/users/:userId/expense-profile", cw(ExpenseProfileController.upsertByUser));

// (optionnel) supprimer le profil frais
router.delete("/api/users/:userId/expense-profile", cw(ExpenseProfileController.deleteByUser));

/* ======================================================================
   ✅ CODES BUDGÉTAIRES (globaux)
   ====================================================================== */

// Liste (pour select dans le formulaire)
router.get("/api/expense/budget-codes", cw(BudgetCodeController.getAll));

// Détail
router.get("/api/expense/budget-codes/:id", cw(BudgetCodeController.getById));

// (admin) création / édition / suppression (si tu veux gérer la liste)
router.post("/api/expense/budget-codes", cw(BudgetCodeController.create));
router.put("/api/expense/budget-codes/:id", cw(BudgetCodeController.update));
router.delete("/api/expense/budget-codes/:id", cw(BudgetCodeController.delete));

/* ======================================================================
   ✅ FICHES DE FRAIS (ExpenseClaim)
   ====================================================================== */

// Liste admin (filtres via querystring)
// Ex: /api/expense/claims?status=submitted&eventId=12&userId=5&from=2026-01-01&to=2026-02-01
router.get("/api/expense/claims", cw(ExpenseClaimController.getAll));

// Compteur (utile dashboard)
router.get("/api/expense/claims/count", cw(ExpenseClaimController.count));

// Graphiques / stats (par statut, par mois, top events…)
router.get("/api/expense/claims/stats", cw(ExpenseClaimController.getStats));

// Export Excel (stream ou génération fichier)
router.get("/api/expense/claims/export", cw(ExpenseClaimController.exportExcel));

// Mes fiches (côté utilisateur)
router.get("/api/users/:userId/expense/claims", cw(ExpenseClaimController.getByUser));

// Détail d’une fiche
router.get("/api/expense/claims/:id", cw(ExpenseClaimController.getById));

// Création d’une fiche
router.post("/api/expense/claims", cw(ExpenseClaimController.create));

// Mise à jour d’une fiche (statut draft en général)
router.put("/api/expense/claims/:id", cw(ExpenseClaimController.update));

// Suppression d’une fiche (souvent autorisé seulement si draft)
router.delete("/api/expense/claims/:id", cw(ExpenseClaimController.delete));

/* ======================================================================
   ✅ WORKFLOW (soumission / validation / paiement)
   ====================================================================== */

// Soumettre la fiche (draft -> submitted)
router.post("/api/expense/claims/:id/submit", cw(ExpenseClaimController.submit));

// Admin : approuver
router.post("/api/expense/claims/:id/approve", cw(ExpenseClaimController.approve));

// Admin : rejeter
router.post("/api/expense/claims/:id/reject", cw(ExpenseClaimController.reject));

// Admin : marquer payé
router.post("/api/expense/claims/:id/mark-paid", cw(ExpenseClaimController.markPaid));

/* ======================================================================
   ✅ LIGNES DE FRAIS (ExpenseClaimItem)
   ====================================================================== */

// Liste des lignes d’une fiche
router.get("/api/expense/claims/:claimId/items", cw(ExpenseClaimItemController.getByClaim));

// Ajouter une ligne
router.post("/api/expense/claims/:claimId/items", cw(ExpenseClaimItemController.create));

// Modifier une ligne
router.put("/api/expense/items/:id", cw(ExpenseClaimItemController.update));

// Supprimer une ligne
router.delete("/api/expense/items/:id", cw(ExpenseClaimItemController.delete));

/* ======================================================================
   ✅ JUSTIFICATIFS (ExpenseClaimAttachment)
   ====================================================================== */

// Liste des fichiers d’une fiche
router.get("/api/expense/claims/:claimId/attachments", cw(ExpenseClaimAttachmentController.getByClaim));

// Upload justificatif (sur une fiche)
router.post(
  "/api/expense/claims/:claimId/attachments",
  uploadExpenseAttachment.single("file"), // ✅ champ "file"
  cw(ExpenseClaimAttachmentController.uploadToClaim)
);

// Upload justificatif (lié à une ligne)
router.post(
  "/api/expense/items/:itemId/attachments",
  uploadExpenseAttachment.single("file"), // ✅ champ "file"
  cw(ExpenseClaimAttachmentController.uploadToItem)
);

// Supprimer un fichier
router.delete("/api/expense/attachments/:id", cw(ExpenseClaimAttachmentController.delete));

module.exports = router;
