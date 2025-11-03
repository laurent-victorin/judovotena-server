const Vote = require("../models/Vote");
const Question = require("../models/Question");
const Ballot = require("../models/Ballot");
const Choice = require("../models/Choice");
const UserVoteToken = require("../models/UserVoteToken");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const errorController = require("./errorController");
const { isRoleAllowed } = require("../utils/isRoleAllowed");
const Users = require("../models/Users");

const voteController = {
  /// ============================
  /// 📦 VOTES
  /// ============================

  /// GET - Tous les votes
  getAllVotes: async (req, res, next) => {
    try {
      const roleId = req.user?.role_id;

      // Si tu veux autoriser l'appel sans auth, roleId peut être undefined :
      // dans ce cas on ne filtre pas (ou on renvoie vide, à toi de choisir).
      const where = {};
      if (typeof roleId === "number") {
        where[Op.or] = [
          { allowed_roles: null },
          Sequelize.literal("JSON_LENGTH(allowed_roles) = 0"),
          Sequelize.literal(
            `JSON_CONTAINS(allowed_roles, CAST(${roleId} AS JSON), '$')`
          ),
        ];
      }

      const votes = await Vote.findAll({
        where,
        attributes: {
          include: [
            [
              Sequelize.literal(`(
            SELECT COUNT(*)
            FROM questions_db AS questions
            WHERE questions.vote_id = Vote.id
          )`),
              "questionCount",
            ],
            [
              Sequelize.literal(`(
            SELECT COUNT(DISTINCT user_id)
            FROM ballots_db AS ballots
            WHERE ballots.vote_id = Vote.id
          )`),
              "voterCount",
            ],
          ],
        },
        order: [["createdAt", "DESC"]],
      });

      res.json(votes);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // GET - Un vote par ID + ses questions + leurs réponses (choices)
  getVoteById: async (req, res, next) => {
    try {
      const roleId = req.user?.role_id;

      const vote = await Vote.findByPk(req.params.id, {
        include: [
          {
            model: Question,
            as: "questions",
            include: [{ model: Choice, as: "choices" }],
          },
        ],
      });
      if (!vote) return res.status(404).json({ message: "Vote non trouvé" });

      if (typeof roleId === "number" && !isRoleAllowed(vote, roleId)) {
        return res.status(403).json({ message: "Accès interdit pour ce rôle" });
      }

      res.json(vote);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // GET - Résultats d'un vote
  getVoteResults: async (req, res) => {
    try {
      const voteId = req.params.id;

      const vote = await Vote.findByPk(voteId, {
        include: [
          {
            model: Question,
            as: "questions",
            include: [
              {
                model: Choice,
                as: "choices",
              },
            ],
          },
        ],
      });

      if (!vote) {
        return res.status(404).json({ message: "Vote introuvable" });
      }

      const results = [];

      for (const question of vote.questions) {
        const ballots = await Ballot.findAll({
          where: { vote_id: vote.id, question_id: question.id },
        });

        if (question.type === "open") {
          const responses = ballots.map((b) => b.answer_text).filter(Boolean);
          results.push({
            question_id: question.id,
            question_text: question.question_text,
            type: question.type,
            responses,
          });
        } else {
          const choiceCounts = {};
          for (const choice of question.choices) {
            choiceCounts[choice.id] = {
              choice_text: choice.choice_text,
              count: 0,
            };
          }

          for (const b of ballots) {
            if (b.choice_id && choiceCounts[b.choice_id]) {
              choiceCounts[b.choice_id].count += 1;
            }
          }

          results.push({
            question_id: question.id,
            question_text: question.question_text,
            type: question.type,
            choices: Object.entries(choiceCounts).map(([id, data]) => ({
              choice_id: parseInt(id),
              choice_text: data.choice_text,
              count: data.count,
            })),
          });
        }
      }

      res.json({ vote_id: vote.id, title: vote.title, results });
    } catch (error) {
      console.error("Erreur récupération résultats :", error);
      errorController._500(error, req, res);
    }
  },

  /// POST - Créer un nouveau vote / sondage
  createVote: async (req, res, next) => {
    try {
      const vote = await Vote.create(req.body);
      res.status(201).json(vote);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT - Modifier un vote
  updateVote: async (req, res, next) => {
    try {
      const [updatedRows] = await Vote.update(req.body, {
        where: { id: req.params.id },
      });
      if (updatedRows === 0) {
        return res.status(404).json({ message: "Vote non trouvé" });
      }
      res.json({ message: "Vote mis à jour avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE - Supprimer un vote
  deleteVote: async (req, res, next) => {
    const voteId = req.params.id;

    try {
      // Supprimer les Ballots liés aux questions de ce vote
      await Ballot.destroy({
        where: {
          vote_id: voteId,
        },
      });

      // Supprimer les Choices liés aux questions de ce vote
      await Choice.destroy({
        where: {
          question_id: {
            [Op.in]: Sequelize.literal(
              `(SELECT id FROM questions_db WHERE vote_id = ${voteId})`
            ),
          },
        },
      });

      // Supprimer les Questions du vote
      await Question.destroy({
        where: { vote_id: voteId },
      });

      // Supprimer le vote lui-même
      const deleted = await Vote.destroy({
        where: { id: voteId },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Vote non trouvé" });
      }

      res.json({ message: "Vote supprimé avec succès" });
    } catch (error) {
      console.error("Erreur suppression vote :", error);
      errorController._500(error, req, res);
    }
  },

  /// ============================
  /// ❓ QUESTIONS
  /// ============================

  /// POST - Ajouter une question à un vote
  addQuestion: async (req, res, next) => {
    try {
      const { voteId } = req.params;
      const { question_text, type } = req.body;

      const question = await Question.create({
        vote_id: voteId,
        question_text,
        type, // 'single' ou 'multiple'
      });

      res.status(201).json(question);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT - Modifier une question
  updateQuestion: async (req, res, next) => {
    try {
      const { id } = req.params;

      const [updatedRows] = await Question.update(req.body, {
        where: { id },
      });

      if (updatedRows === 0) {
        return res.status(404).json({ message: "Question non trouvée" });
      }

      res.json({ message: "Question mise à jour avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE - Supprimer une question
  deleteQuestion: async (req, res, next) => {
    const { id } = req.params;

    try {
      // Supprimer les Ballots liés à cette question
      await Ballot.destroy({
        where: { question_id: id },
      });

      // Supprimer les Choices liés à cette question
      await Choice.destroy({
        where: { question_id: id },
      });

      // Supprimer la question elle-même
      const deleted = await Question.destroy({
        where: { id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Question non trouvée" });
      }

      res.json({ message: "Question supprimée avec succès" });
    } catch (error) {
      console.error("Erreur suppression question :", error);
      errorController._500(error, req, res);
    }
  },

  /// ============================
  /// ✅ CHOICES (réponses)
  /// ============================

  /// POST - Ajouter un choix à une question
  addChoice: async (req, res, next) => {
    try {
      const { questionId } = req.params;
      const { choice_text } = req.body;

      const choice = await Choice.create({
        question_id: questionId,
        choice_text,
      });

      res.status(201).json(choice);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT - Modifier un choix
  updateChoice: async (req, res, next) => {
    try {
      const { id } = req.params;

      const [updatedRows] = await Choice.update(req.body, {
        where: { id },
      });

      if (updatedRows === 0) {
        return res.status(404).json({ message: "Choix non trouvé" });
      }

      res.json({ message: "Choix mis à jour avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE - Supprimer un choix
  deleteChoice: async (req, res, next) => {
    const { id } = req.params;

    try {
      // Supprimer d'abord les réponses liées à ce choix
      await Ballot.destroy({
        where: { choice_id: id },
      });

      // Ensuite supprimer le choix lui-même
      const deleted = await Choice.destroy({
        where: { id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Choix non trouvé" });
      }

      res.json({ message: "Choix supprimé avec succès" });
    } catch (error) {
      console.error("Erreur suppression choix :", error);
      errorController._500(error, req, res);
    }
  },

  /// ============================
  /// 🧾 BALLOTS (votes anonymes soumis)
  /// ============================

  /**
   * Format attendu dans le body :
   * {
   *   token: "xyz",
   *   responses: [
   *     { question_id: 1, choice_id: 3 },
   *     { question_id: 2, choice_id: 6 }
   *   ]
   * }
   */
  submitVote: async (req, res) => {
    try {
      const userId = req.user?.id || req.body.user_id; // en cas d'appel sans token auth
      const { vote_id, responses } = req.body;

      if (!userId || !vote_id || !responses) {
        return res.status(400).json({ message: "Données manquantes" });
      }

      // Vérifie si l'utilisateur a déjà voté
      const alreadyVoted = await Ballot.findOne({
        where: { vote_id, user_id: userId },
      });

      if (alreadyVoted) {
        return res.status(400).json({ message: "Vous avez déjà voté." });
      }

      // Boucle sur chaque réponse
      for (const [questionId, response] of Object.entries(responses)) {
        const question = await Question.findByPk(questionId);

        if (question.type === "open") {
          await Ballot.create({
            vote_id,
            question_id: questionId,
            answer_text: response,
            user_id: userId,
          });
        } else if (Array.isArray(response)) {
          for (const choiceId of response) {
            await Ballot.create({
              vote_id,
              question_id: questionId,
              choice_id: choiceId,
              user_id: userId,
            });
          }
        } else {
          await Ballot.create({
            vote_id,
            question_id: questionId,
            choice_id: response,
            user_id: userId,
          });
        }
      }

      return res.json({ message: "Vote enregistré avec succès" });
    } catch (error) {
      console.error("❌ Erreur soumission vote :", error);
      errorController._500(error, req, res);
    }
  },

  // GET - Toutes les réponses d'un utilisateur
  getUserBallots: async (req, res) => {
    try {
      const userId = req.params.userId;
      const ballots = await Ballot.findAll({
        where: { user_id: userId },
        attributes: ["vote_id", "timestamp"],
      });
      res.json(ballots);
    } catch (error) {
      console.error("Erreur getUserBallots:", error);
      errorController._500(error, req, res);
    }
  },

  /// ============================
  /// 🔐 USER VOTE TOKEN (invités)
  /// ============================

  /// POST - Générer des tokens d'invitation pour un vote
  generateTokens: async (req, res, next) => {
    try {
      const { voteId } = req.params;
      const { users } = req.body;
      /**
       * Format attendu :
       * users: [
       *   { email: "exemple@club.com", club_name: "Club Judo 33" },
       *   ...
       * ]
       */

      const tokens = [];

      for (const user of users) {
        const rawToken = crypto.randomUUID(); // UUID v4
        const hashedToken = crypto
          .createHash("sha256")
          .update(rawToken)
          .digest("hex");

        await UserVoteToken.create({
          email: user.email,
          club_name: user.club_name,
          vote_id: voteId,
          token: hashedToken,
          has_voted: false,
        });

        tokens.push({
          email: user.email,
          club_name: user.club_name,
          token: rawToken, // on renvoie le token brut à utiliser dans l’URL
        });
      }

      res.status(201).json({ tokens });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// GET - Vérifier validité d’un token
  checkToken: async (req, res, next) => {
    try {
      const rawToken = req.params.token;
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      const tokenEntry = await UserVoteToken.findOne({
        where: { token: hashedToken },
      });

      if (!tokenEntry) {
        return res
          .status(404)
          .json({ valid: false, message: "Token invalide" });
      }

      if (tokenEntry.has_voted) {
        return res
          .status(400)
          .json({ valid: false, message: "Vote déjà soumis" });
      }

      res.json({
        valid: true,
        vote_id: tokenEntry.vote_id,
        club_name: tokenEntry.club_name,
      });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// GET - Voir tous les tokens d’un vote
  getVoteTokens: async (req, res, next) => {
    try {
      const { voteId } = req.params;

      const tokens = await UserVoteToken.findAll({
        where: { vote_id: voteId },
        order: [["createdAt", "DESC"]],
      });

      res.json(tokens);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE - Supprimer un token
  deleteToken: async (req, res, next) => {
    try {
      const { id } = req.params;

      const deleted = await UserVoteToken.destroy({
        where: { id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Token non trouvé" });
      }

      res.json({ message: "Token supprimé avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = voteController;
