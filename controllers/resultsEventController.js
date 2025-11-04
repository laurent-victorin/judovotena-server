// controllers/resultsEventController.js
const { Op } = require("sequelize");
const ResultsEvent = require("../models/ResultsEvent");
const Event = require("../models/Event");
const errorController = require("./errorController");

/* Helpers */
const ALLOWED_FIELDS = [
  "event_id",
  "titre",
  "start",
  "type_event",
  "level_event",
  "cate_event",
  "lieu_event",
  "organisateur",
  "rapport_url",
  "tableaux_url",
  "selection_url",
  "photospodium_url",
];

const LINK_FIELDS = [
  "rapport_url",
  "tableaux_url",
  "selection_url",
  "photospodium_url",
];

const pickProvided = (src, fields) => {
  const out = {};
  fields.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(src, k)) out[k] = src[k];
  });
  return out;
};

const resultsEventController = {
  /// GET
  // Tous les résultats (avec option de pagination & recherche simple)
  // /api/results-events?limit=50&offset=0&q=string
  getAllResults: async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit || "200", 10), 500);
      const offset = parseInt(req.query.offset || "0", 10);
      const q = (req.query.q || "").trim();

      const where = {};
      if (q) {
        where[Op.or] = [
          { titre: { [Op.like]: `%${q}%` } },
          { type_event: { [Op.like]: `%${q}%` } },
          { cate_event: { [Op.like]: `%${q}%` } },
          { lieu_event: { [Op.like]: `%${q}%` } },
          { organisateur: { [Op.like]: `%${q}%` } },
        ];
      }

      const rows = await ResultsEvent.findAll({
        where,
        order: [
          ["start", "DESC"],
          ["id", "DESC"],
        ],
        limit,
        offset,
      });

      res.json(rows);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Un résultat par id
  getResultById: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await ResultsEvent.findByPk(id);
      if (!row) return errorController._404(req, res);
      res.json(row);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Tous les résultats pour un event_id
  getResultsByEventId: async (req, res) => {
    try {
      const { eventId } = req.params;
      const rows = await ResultsEvent.findAll({
        where: { event_id: eventId },
        order: [
          ["start", "DESC"],
          ["id", "DESC"],
        ],
      });
      res.json(rows);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Créer un ResultsEvent générique (body complet autorisé)
  create: async (req, res) => {
    try {
      const payload = pickProvided(req.body, ALLOWED_FIELDS);
      const created = await ResultsEvent.create(payload);
      res.status(201).json(created);
    } catch (error) {
      errorController._400(error, req, res);
    }
  },

  // Créer un ResultsEvent à partir d'un Event existant
  // Copie les champs: titre, start, type_event, level_event, cate_event, lieu_event, organisateur
  // et ajoute éventuellement les liens passés dans le body
  createFromEvent: async (req, res) => {
    try {
      const { eventId } = req.params;
      const ev = await Event.findByPk(eventId);
      if (!ev) return errorController._404(req, res);

      const links = pickProvided(req.body || {}, LINK_FIELDS);

      const payload = {
        event_id: ev.id,
        titre: ev.titre,
        start: ev.start,
        type_event: ev.type_event,
        level_event: ev.level_event,
        cate_event: ev.cate_event,
        lieu_event: ev.lieu_event,
        organisateur: ev.organisateur,
        ...links,
      };

      const created = await ResultsEvent.create(payload);
      res.status(201).json(created);
    } catch (error) {
      errorController._400(error, req, res);
    }
  },

  /// PUT / PATCH
  // Mettre à jour toutes les infos d'un ResultsEvent
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await ResultsEvent.findByPk(id);
      if (!row) return errorController._404(req, res);

      const payload = pickProvided(req.body, ALLOWED_FIELDS);
      await row.update(payload);
      res.json(row);
    } catch (error) {
      errorController._400(error, req, res);
    }
  },

  // Mettre à jour uniquement les liens
  updateLinks: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await ResultsEvent.findByPk(id);
      if (!row) return errorController._404(req, res);

      const updates = pickProvided(req.body, LINK_FIELDS);
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message:
            "Aucun champ de lien fourni. Attendu: rapport_url, tableaux_url, selection_url, photospodium_url.",
        });
      }

      await row.update(updates);
      res.json(row);
    } catch (error) {
      errorController._400(error, req, res);
    }
  },

  /// DELETE
  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await ResultsEvent.findByPk(id);
      if (!row) return errorController._404(req, res);

      await row.destroy();
      res.json({ message: `ResultsEvent ${id} supprimé.` });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = resultsEventController;
