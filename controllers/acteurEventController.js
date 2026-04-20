const ActeurEvent = require("../models/ActeurEvent");
const Acteurs = require("../models/Acteurs");
const Event = require("../models/Event");
const UserActeur = require("../models/UserActeur");
const errorController = require("./errorController");
const { Op } = require("sequelize");
const sequelize = require("../database");

const ACTEUR_EVENT_THROUGH_ATTRIBUTES = [
  "id",
  "acteur_id",
  "event_id",
  "poste",
  "tapis",
  "is_validate",
  "note",
  "observations",
  "response_status",
  "response_reason",
  "responded_at",
  "need_transport_support",
  "need_accommodation_support",
  "support_request_comment",
  "support_requested_at",
  "transport_support_status",
  "accommodation_support_status",
  "attendance_status",
];

const ALLOWED_RESPONSE_STATUSES = ["accepted", "rejected", "pending"];
const ALLOWED_SUPPORT_STATUSES = ["pending", "approved", "rejected"];
const ALLOWED_ATTENDANCE_STATUSES = ["present", "absent", "unknown"];

const getConnectedUserId = (req) => {
  return req.user?.userId || req.user?.id || null;
};

const hasOwn = (obj, key) =>
  Object.prototype.hasOwnProperty.call(obj || {}, key);

const cleanNullableString = (value) => {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
};

const parseNullableBoolean = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (["true", "1", "oui", "yes"].includes(v)) return true;
    if (["false", "0", "non", "no"].includes(v)) return false;
    if (v === "null") return null;
  }
  return undefined;
};

const normalizeEnumOrNull = (value, allowedValues) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const normalized = String(value).trim();
  if (allowedValues.includes(normalized)) return normalized;

  return undefined;
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
              attributes: ACTEUR_EVENT_THROUGH_ATTRIBUTES,
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
              attributes: ACTEUR_EVENT_THROUGH_ATTRIBUTES,
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

  // Récupérer une relation acteur/événement précise
  getActeurEventById: async (req, res, next) => {
    try {
      const { acteurId, eventId } = req.params;

      const acteurEvent = await ActeurEvent.findOne({
        where: {
          acteur_id: acteurId,
          event_id: eventId,
        },
        include: [
          {
            model: Event,
            as: "Event",
            attributes: [
              "id",
              "titre",
              "description",
              "start",
              "end",
              "lieu_event",
              "type_event",
              "level_event",
              "cate_event",
            ],
          },
          {
            model: Acteurs,
            as: "Acteur",
            attributes: ["id", "nom", "prenom", "email", "club_acteur"],
          },
        ],
      });

      if (!acteurEvent) {
        return res.status(404).json({
          message: "Relation acteur/événement introuvable",
        });
      }

      res.json(acteurEvent);
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

  // Récupérer les demandes de prise en charge par événement
  getSupportRequestsByEventId: async (req, res, next) => {
    try {
      const { eventId } = req.params;

      const event = await Event.findByPk(eventId, {
        attributes: ["id", "titre", "start", "end", "lieu_event"],
      });

      if (!event) {
        return res.status(404).json({ message: "Événement introuvable" });
      }

      const requests = await ActeurEvent.findAll({
        where: {
          event_id: eventId,
          [Op.or]: [
            { need_transport_support: true },
            { need_accommodation_support: true },
            { transport_support_status: { [Op.not]: null } },
            { accommodation_support_status: { [Op.not]: null } },
          ],
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
            attributes: ["id", "nom", "prenom", "email", "club_acteur"],
          },
        ],
        order: [[{ model: Acteurs, as: "Acteur" }, "nom", "ASC"]],
      });

      res.json({
        event,
        requests,
      });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Fonction pour assigner un acteur sur un événement
  assignActorToEvent: async (req, res, next) => {
    try {
      const {
        acteur_id,
        event_id,
        poste,
        tapis,
        need_transport_support,
        need_accommodation_support,
        support_request_comment,
      } = req.body;

      const existing = await ActeurEvent.findOne({
        where: { acteur_id, event_id },
      });

      if (existing) {
        return res.status(409).json({
          message: "Cet acteur est déjà affecté à cet événement",
        });
      }

      const parsedTransport = parseNullableBoolean(need_transport_support);
      const parsedAccommodation = parseNullableBoolean(
        need_accommodation_support,
      );

      if (
        need_transport_support !== undefined &&
        parsedTransport === undefined
      ) {
        return res.status(400).json({
          message: "need_transport_support doit être un booléen, null, 0 ou 1",
        });
      }

      if (
        need_accommodation_support !== undefined &&
        parsedAccommodation === undefined
      ) {
        return res.status(400).json({
          message:
            "need_accommodation_support doit être un booléen, null, 0 ou 1",
        });
      }

      const acteurEvent = await ActeurEvent.create({
        acteur_id,
        event_id,
        poste: cleanNullableString(poste),
        tapis: cleanNullableString(tapis),
        response_status: "pending",
        response_reason: null,
        responded_at: null,
        need_transport_support:
          need_transport_support !== undefined ? parsedTransport : null,
        need_accommodation_support:
          need_accommodation_support !== undefined ? parsedAccommodation : null,
        support_request_comment: cleanNullableString(support_request_comment),
        support_requested_at:
          need_transport_support !== undefined ||
          need_accommodation_support !== undefined ||
          support_request_comment !== undefined
            ? new Date()
            : null,
        transport_support_status: parsedTransport === true ? "pending" : null,
        accommodation_support_status:
          parsedAccommodation === true ? "pending" : null,
      });

      res.json(acteurEvent);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Synchroniser les convocations d'un événement sur un périmètre d'acteurs
  syncActorsSelectionForEvent: async (req, res, next) => {
    try {
      const { event_id, acteur_ids, scope_acteur_ids, poste, tapis } = req.body;

      const parsedEventId = Number(event_id);
      const cleanedPoste = cleanNullableString(poste);
      const cleanedTapis = cleanNullableString(tapis);

      const selectedActeurIds = [
        ...new Set(
          (Array.isArray(acteur_ids) ? acteur_ids : [])
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ];

      const scopeActeurIds = [
        ...new Set(
          (Array.isArray(scope_acteur_ids) ? scope_acteur_ids : [])
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0),
        ),
      ];

      if (!parsedEventId) {
        return res.status(400).json({
          message: "event_id invalide",
        });
      }

      if (!cleanedPoste) {
        return res.status(400).json({
          message: "Le poste est obligatoire",
        });
      }

      if (scopeActeurIds.length === 0) {
        return res.status(400).json({
          message: "scope_acteur_ids doit contenir au moins un acteur",
        });
      }

      const selectedOutsideScope = selectedActeurIds.filter(
        (id) => !scopeActeurIds.includes(id),
      );

      if (selectedOutsideScope.length > 0) {
        return res.status(400).json({
          message: "Tous les acteur_ids doivent appartenir à scope_acteur_ids",
        });
      }

      const event = await Event.findByPk(parsedEventId, {
        attributes: ["id", "titre", "start"],
      });

      if (!event) {
        return res.status(404).json({
          message: "Événement introuvable",
        });
      }

      const scopeActeurs = await Acteurs.findAll({
        where: {
          id: {
            [Op.in]: scopeActeurIds,
          },
        },
        attributes: ["id"],
      });

      const existingScopeIds = scopeActeurs.map((a) => Number(a.id));
      const missingScopeIds = scopeActeurIds.filter(
        (id) => !existingScopeIds.includes(id),
      );

      if (missingScopeIds.length > 0) {
        return res.status(400).json({
          message: `Acteurs introuvables : ${missingScopeIds.join(", ")}`,
        });
      }

      const selectedSet = new Set(selectedActeurIds);

      let createdActeurIds = [];
      let removedActeurIds = [];
      let keptActeurIds = [];

      await sequelize.transaction(async (transaction) => {
        const existingLinks = await ActeurEvent.findAll({
          where: {
            event_id: parsedEventId,
            acteur_id: {
              [Op.in]: scopeActeurIds,
            },
          },
          attributes: ["acteur_id"],
          transaction,
        });

        const existingIds = new Set(
          existingLinks.map((item) => Number(item.acteur_id)),
        );

        createdActeurIds = selectedActeurIds.filter(
          (id) => !existingIds.has(id),
        );
        keptActeurIds = selectedActeurIds.filter((id) => existingIds.has(id));
        removedActeurIds = scopeActeurIds.filter(
          (id) => existingIds.has(id) && !selectedSet.has(id),
        );

        if (createdActeurIds.length > 0) {
          await ActeurEvent.bulkCreate(
            createdActeurIds.map((acteurId) => ({
              acteur_id: acteurId,
              event_id: parsedEventId,
              poste: cleanedPoste,
              tapis: cleanedTapis,
              response_status: "pending",
              response_reason: null,
              responded_at: null,
              need_transport_support: null,
              need_accommodation_support: null,
              support_request_comment: null,
              support_requested_at: null,
              transport_support_status: null,
              accommodation_support_status: null,
              attendance_status: null,
            })),
            { transaction },
          );
        }

        if (removedActeurIds.length > 0) {
          await ActeurEvent.destroy({
            where: {
              event_id: parsedEventId,
              acteur_id: {
                [Op.in]: removedActeurIds,
              },
            },
            transaction,
          });
        }
      });

      return res.json({
        success: true,
        event_id: parsedEventId,
        scopeCount: scopeActeurIds.length,
        selectedCount: selectedActeurIds.length,
        createdCount: createdActeurIds.length,
        removedCount: removedActeurIds.length,
        keptCount: keptActeurIds.length,
        createdActeurIds,
        removedActeurIds,
        keptActeurIds,
      });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Fonction pour mettre à jour note + observations d'un acteur dans un événement
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

      if (hasOwn(req.body, "note")) {
        acteurEvent.note =
          note === undefined || note === null || note === ""
            ? null
            : Number(note);
      }

      if (hasOwn(req.body, "observations")) {
        acteurEvent.observations = cleanNullableString(observations);
      }

      await acteurEvent.save();

      res.json(acteurEvent);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour mettre à jour poste/tapis
  updateAssignment: async (req, res, next) => {
    try {
      const { acteurId, eventId } = req.params;
      const { poste, tapis } = req.body;

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

      if (hasOwn(req.body, "poste")) {
        acteurEvent.poste = cleanNullableString(poste);
      }

      if (hasOwn(req.body, "tapis")) {
        acteurEvent.tapis = cleanNullableString(tapis);
      }

      await acteurEvent.save();

      res.json(acteurEvent);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Mise à jour du statut de prise en charge par l'admin
  updateSupportStatus: async (req, res, next) => {
    try {
      const { acteurId, eventId } = req.params;
      const { transport_support_status, accommodation_support_status } =
        req.body;

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

      if (hasOwn(req.body, "transport_support_status")) {
        const normalizedTransportStatus = normalizeEnumOrNull(
          transport_support_status,
          ALLOWED_SUPPORT_STATUSES,
        );

        if (normalizedTransportStatus === undefined) {
          return res.status(400).json({
            message:
              "transport_support_status doit être 'pending', 'approved', 'rejected' ou null",
          });
        }

        if (
          normalizedTransportStatus !== null &&
          acteurEvent.need_transport_support !== true
        ) {
          return res.status(400).json({
            message:
              "Aucune demande de prise en charge transport n'a été formulée",
          });
        }

        acteurEvent.transport_support_status = normalizedTransportStatus;
      }

      if (hasOwn(req.body, "accommodation_support_status")) {
        const normalizedAccommodationStatus = normalizeEnumOrNull(
          accommodation_support_status,
          ALLOWED_SUPPORT_STATUSES,
        );

        if (normalizedAccommodationStatus === undefined) {
          return res.status(400).json({
            message:
              "accommodation_support_status doit être 'pending', 'approved', 'rejected' ou null",
          });
        }

        if (
          normalizedAccommodationStatus !== null &&
          acteurEvent.need_accommodation_support !== true
        ) {
          return res.status(400).json({
            message:
              "Aucune demande de prise en charge hébergement n'a été formulée",
          });
        }

        acteurEvent.accommodation_support_status =
          normalizedAccommodationStatus;
      }

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
      const {
        response_status,
        response_reason,
        need_transport_support,
        need_accommodation_support,
        support_request_comment,
      } = req.body;

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

      if (
        response_status === "rejected" &&
        !String(response_reason || "").trim()
      ) {
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

      if (response_status === "rejected") {
        acteurEvent.need_transport_support = null;
        acteurEvent.need_accommodation_support = null;
        acteurEvent.support_request_comment = null;
        acteurEvent.support_requested_at = null;
        acteurEvent.transport_support_status = null;
        acteurEvent.accommodation_support_status = null;
      }

      if (response_status === "accepted") {
        if (hasOwn(req.body, "need_transport_support")) {
          const parsedTransport = parseNullableBoolean(need_transport_support);

          if (parsedTransport === undefined) {
            return res.status(400).json({
              message:
                "need_transport_support doit être un booléen, null, 0 ou 1",
            });
          }

          acteurEvent.need_transport_support = parsedTransport;
          acteurEvent.transport_support_status =
            parsedTransport === true ? "pending" : null;
        }

        if (hasOwn(req.body, "need_accommodation_support")) {
          const parsedAccommodation = parseNullableBoolean(
            need_accommodation_support,
          );

          if (parsedAccommodation === undefined) {
            return res.status(400).json({
              message:
                "need_accommodation_support doit être un booléen, null, 0 ou 1",
            });
          }

          acteurEvent.need_accommodation_support = parsedAccommodation;
          acteurEvent.accommodation_support_status =
            parsedAccommodation === true ? "pending" : null;
        }

        if (hasOwn(req.body, "support_request_comment")) {
          acteurEvent.support_request_comment = cleanNullableString(
            support_request_comment,
          );
        }

        if (
          hasOwn(req.body, "need_transport_support") ||
          hasOwn(req.body, "need_accommodation_support") ||
          hasOwn(req.body, "support_request_comment")
        ) {
          acteurEvent.support_requested_at = new Date();
        }
      }

      await acteurEvent.save();

      res.json(acteurEvent);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Mise à jour de la présence réelle le jour J
  updateAttendance: async (req, res, next) => {
    try {
      const { acteurId, eventId } = req.params;
      const { attendance_status } = req.body;

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

      const normalizedAttendance = normalizeEnumOrNull(
        attendance_status,
        ALLOWED_ATTENDANCE_STATUSES,
      );

      if (normalizedAttendance === undefined) {
        return res.status(400).json({
          message:
            "attendance_status doit être 'present', 'absent', 'unknown' ou null",
        });
      }

      acteurEvent.attendance_status = normalizedAttendance;
      await acteurEvent.save();

      res.json(acteurEvent);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Mise à jour en lot des affectations poste/tapis
  bulkUpdateAssignments: async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const assignments = Array.isArray(req.body)
        ? req.body
        : req.body.assignments;

      if (!Array.isArray(assignments) || assignments.length === 0) {
        return res.status(400).json({
          message:
            "Le body doit être un tableau ou contenir une clé assignments non vide",
        });
      }

      const updatedItems = [];

      await sequelize.transaction(async (transaction) => {
        for (const item of assignments) {
          const acteurId = item.acteur_id || item.acteurId;

          if (!acteurId) {
            const err = new Error("acteur_id manquant dans une ligne");
            err.status = 400;
            throw err;
          }

          const acteurEvent = await ActeurEvent.findOne({
            where: {
              acteur_id: acteurId,
              event_id: eventId,
            },
            transaction,
          });

          if (!acteurEvent) {
            const err = new Error(
              `Relation acteur/événement introuvable pour acteur_id=${acteurId}`,
            );
            err.status = 404;
            throw err;
          }

          if (hasOwn(item, "poste")) {
            acteurEvent.poste = cleanNullableString(item.poste);
          }

          if (hasOwn(item, "tapis")) {
            acteurEvent.tapis = cleanNullableString(item.tapis);
          }

          await acteurEvent.save({ transaction });
          updatedItems.push(acteurEvent);
        }
      });

      res.json({
        success: true,
        count: updatedItems.length,
        items: updatedItems,
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }

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
