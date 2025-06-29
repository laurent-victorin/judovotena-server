const express = require("express");
const router = express.Router();
const voteController = require("../controllers/voteController");
const cw = require("../controllers/controllerWrapper");

/// ===========================
/// 📦 VOTES
/// ===========================

/// GET - Tous les votes
router.get("/api/vote/all", cw(voteController.getAllVotes));

/// GET - Un vote par ID
router.get("/api/vote/:id", cw(voteController.getVoteById));

// afficher les résultats d'un vote
router.get("/api/vote/:id/results", cw(voteController.getVoteResults));

/// POST - Créer un nouveau vote / sondage
router.post("/api/vote/create", cw(voteController.createVote));

/// PUT - Modifier un vote
router.put("/api/vote/update/:id", cw(voteController.updateVote));

/// DELETE - Supprimer un vote
router.delete("/api/vote/delete/:id", cw(voteController.deleteVote));

/// ===========================
/// ❓ QUESTIONS
/// ===========================

/// POST - Ajouter une question à un vote
router.post("/api/vote/:voteId/questions", cw(voteController.addQuestion));

/// PUT - Modifier une question
router.put("/api/question/update/:id", cw(voteController.updateQuestion));

/// DELETE - Supprimer une question
router.delete("/api/question/delete/:id", cw(voteController.deleteQuestion));

/// ===========================
/// ✅ CHOICES (réponses)
/// ===========================

/// POST - Ajouter un choix à une question
router.post("/api/question/:questionId/choices", cw(voteController.addChoice));

/// PUT - Modifier un choix
router.put("/api/choice/update/:id", cw(voteController.updateChoice));

/// DELETE - Supprimer un choix
router.delete("/api/choice/delete/:id", cw(voteController.deleteChoice));

/// ===========================
/// 🧾 BALLOTS (votes anonymes soumis)
/// ===========================

/// POST - Soumettre un vote (token + réponses)
router.post("/api/vote/submit", cw(voteController.submitVote));

/// GET - Voir les votes d’un utilisateur
router.get("/api/vote/ballots/:userId", cw(voteController.getUserBallots));


/// ===========================
/// 🔐 USER VOTE TOKEN (invités)
/// ===========================

/// POST - Générer des tokens d'invitation pour un vote
router.post(
  "/api/vote/:voteId/generate-tokens",
  cw(voteController.generateTokens)
);

/// GET - Vérifier validité d’un token
router.get("/api/vote/check-token/:token", cw(voteController.checkToken));

/// GET - Voir les tokens d’un vote
router.get("/api/vote/:voteId/tokens", cw(voteController.getVoteTokens));

/// DELETE - Supprimer un token
router.delete("/api/vote/token/delete/:id", cw(voteController.deleteToken));

module.exports = router;
