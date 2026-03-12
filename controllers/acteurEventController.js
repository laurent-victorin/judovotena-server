const Sequelize = require("sequelize");
const ActeurEvent = require("../models/ActeurEvent");
const Acteurs = require("../models/Acteurs");
const Event = require("../models/Event");
const UserActeur = require("../models/UserActeur");
const errorController = require("./errorController");
const { Op } = require("sequelize");
const sequelize = require("../database");

const getConnectedUserId = (req) => {
  return req.user?.userId || req.user?.id || null;
};

const acteurEventController = {
  /// GET
  // Route pour obtenir tous les résultats
  getAllResults: async (req, res, next) => {
    try {
      const results = await ActeurEvent.findAll({
        include: [
          {
            model: Event,
            as: "Event",
            attributes: ["id", "titre", "start"],
          },
          {
            model: Acteurs,
            as: "Acteur",
            attributes: ["id", "nom", "prenom"],
          },
        ],
        order: [
          [{ model: Acteurs, as: "Acteur" }, "nom", "ASC"],
          [{ model: Event, as: "Event" }, "start", "ASC"],
        ],
      });
      res.json(results);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Route pour obtenir la liste des acteurs ayant participé à un événement
  getActeursByEventId: async (req, res, next) => {
    const { eventId } = req.params;
    try {
      const acteurs = await Event.findByPk(eventId, {
        include: [
          {
            model: Acteurs,
            as: "Acteur",
            through: {
              attributes: [
                "id",
                "acteur_id",
                "event_id",
                "poste",
                "is_validate",
                "note",
                "observations",
                "response_status",
                "response_reason",
                "responded_at",
              ],
            },
          },
        ],
      });

      if (!acteurs) {
        return res.status(404).json({ message: "Événement introuvable" });
      }

      res.json(acteurs);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Route pour afficher tous les événements auxquels un acteur a participé
  getEventsByActeurId: async (req, res, next) => {
    const { acteurId } = req.params;
    try {
      const events = await Acteurs.findByPk(acteurId, {
        include: [
          {
            model: Event,
            as: "Events",
            through: {
              attributes: [
                "id",
                "acteur_id",
                "event_id",
                "poste",
                "is_validate",
                "note",
                "observations",
                "response_status",
                "response_reason",
                "responded_at",
              ],
            },
          },
        ],
      });

      if (!events) {
        return res.status(404).json({ message: "Acteur introuvable" });
      }

      res.json(events);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // NOUVEAU : récupérer les convocations de l'utilisateur connecté
  getMyConvocations: async (req, res, next) => {
    try {
      const userId = getConnectedUserId(req);

      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }

      const userActeur = await UserActeur.findOne({
        where: { user_id: userId },
      });

      if (!userActeur) {
        return res.status(404).json({
          message: "Aucun acteur lié à cet utilisateur",
        });
      }

      const acteur = await Acteurs.findByPk(userActeur.acteur_id, {
        attributes: ["id", "nom", "prenom", "email", "club_acteur"],
      });

      if (!acteur) {
        return res.status(404).json({
          message: "Profil acteur introuvable",
        });
      }

      const convocations = await ActeurEvent.findAll({
        where: {
          acteur_id: acteur.id,
        },
        include: [
          {
            model: Event,
            as: "Event",
            attributes: ["id", "titre", "start", "end", "lieu_event"],
          },
          {
            model: Acteurs,
            as: "Acteur",
            attributes: ["id", "nom", "prenom"],
          },
        ],
        order: [[{ model: Event, as: "Event" }, "start", "ASC"]],
      });

      return res.json({
        acteur,
        convocations,
      });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour assigner un acteur sur un événement
  assignActorToEvent: async (req, res, next) => {
    try {
      const { acteur_id, event_id, poste } = req.body;

      const existing = await ActeurEvent.findOne({
        where: { acteur_id, event_id },
      });

      if (existing) {
        return res.status(409).json({
          message: "Cet acteur est déjà affecté à cet événement",
        });
      }

      const acteurEvent = await ActeurEvent.create({
        acteur_id,
        event_id,
        poste,
        response_status: "pending",
        response_reason: null,
        responded_at: null,
      });

      res.json(acteurEvent);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Fonction pour mettre à jour un acteur dans un événement
  updateActeurInEvent: async (req, res, next) => {
    try {
      const { acteurId, eventId } = req.params;
      const { note, observations } = req.body;

      const acteurEvent = await ActeurEvent.findOne({
        where: {
          acteur_id: acteurId,
          event_id: eventId,
        },
      });

      if (!acteurEvent) {
        return res.status(404).json({
          message: "Relation acteur/événement introuvable",
        });
      }

      acteurEvent.note = note;
      acteurEvent.observations = observations;
      await acteurEvent.save();

      res.json(acteurEvent);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour toggle la validation d'un acteur dans un événement
  toggleValidation: async (req, res, next) => {
    try {
      const { acteurId, eventId } = req.params;

      const acteurEvent = await ActeurEvent.findOne({
        where: {
          acteur_id: acteurId,
          event_id: eventId,
        },
      });

      if (!acteurEvent) {
        return res.status(404).json({
          message: "Relation acteur/événement introuvable",
        });
      }

      acteurEvent.is_validate = !acteurEvent.is_validate;
      await acteurEvent.save();

      res.json(acteurEvent);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // NOUVEAU : réponse de l'acteur connecté à sa convocation
  respondToConvocation: async (req, res, next) => {
    try {
      const userId = getConnectedUserId(req);
      const { eventId } = req.params;
      const { response_status, response_reason } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }

      if (!["accepted", "rejected"].includes(response_status)) {
        return res.status(400).json({
          message: "Le statut doit être 'accepted' ou 'rejected'",
        });
      }

      const userActeur = await UserActeur.findOne({
        where: { user_id: userId },
      });

      if (!userActeur) {
        return res.status(404).json({
          message: "Aucun acteur lié à cet utilisateur",
        });
      }

      const acteurEvent = await ActeurEvent.findOne({
        where: {
          acteur_id: userActeur.acteur_id,
          event_id: eventId,
        },
        include: [
          {
            model: Event,
            as: "Event",
            attributes: ["id", "titre", "start"],
          },
          {
            model: Acteurs,
            as: "Acteur",
            attributes: ["id", "nom", "prenom"],
          },
        ],
      });

      if (!acteurEvent) {
        return res.status(404).json({
          message: "Convocation introuvable",
        });
      }

      if (response_status === "rejected" && !String(response_reason || "").trim()) {
        return res.status(400).json({
          message: "Le motif est obligatoire en cas de refus",
        });
      }

      acteurEvent.response_status = response_status;
      acteurEvent.response_reason =
        response_status === "rejected"
          ? String(response_reason || "").trim()
          : null;
      acteurEvent.responded_at = new Date();

      await acteurEvent.save();

      res.json(acteurEvent);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Route pour supprimer un acteur d'un événement avec acteur_id et event_id
  removeActeurFromEvent: async (req, res, next) => {
    try {
      const { acteurId, eventId } = req.params;

      const deletedCount = await ActeurEvent.destroy({
        where: {
          acteur_id: acteurId,
          event_id: eventId,
        },
      });

      if (!deletedCount) {
        return res.status(404).json({
          message: "Relation acteur/événement introuvable",
        });
      }

      res.json({ success: true, deletedCount });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = acteurEventController;