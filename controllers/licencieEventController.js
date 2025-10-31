// controllers/licencieEventController.js
const { Op } = require("sequelize");
const errorController = require("./errorController");

const Licencies = require("../models/Licencies");
const Event = require("../models/Event");
const LicencieEvent = require("../models/LicencieEvent");

/* =========================
   Helpers
   ========================= */
const normLicence = (v) => String(v || "").trim().toUpperCase();
const normSaison = (v) => String(v || "").trim();
const SAISON_RE = /^\d{4}-\d{4}$/;
const isValidGenre = (g) => ["M", "F"].includes(String(g));

const licencieEventController = {
  /* =========================
     POST — Inscrire à un event
     ========================= */
  // POST /api/events/:eventId/registrations
  // Body accepté :
  //   - { licencie_id }
  //   - ou { nom, prenom, club, genre, licence_number, saison }
  registerToEvent: async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (!eventId) {
        return res.status(400).json({ error: "eventId manquant ou invalide." });
      }

      const event = await Event.findByPk(eventId);
      if (!event) {
        return res.status(404).json({ error: "Événement introuvable." });
      }

      let { licencie_id, nom, prenom, club, genre, licence_number, saison } = req.body || {};
      let licencieId = licencie_id ? parseInt(licencie_id, 10) : null;

      // Cas 1 : on a déjà un licencie_id
      if (licencieId) {
        const lic = await Licencies.findByPk(licencieId);
        if (!lic) return res.status(404).json({ error: "Licencié introuvable." });

        try {
          await LicencieEvent.create({ licencie_id: licencieId, event_id: eventId });
          return res.status(201).json({ ok: true, licencie_id: licencieId, event_id: eventId });
        } catch (error) {
          if (error?.name === "SequelizeUniqueConstraintError") {
            return res.status(200).json({ ok: true, alreadyRegistered: true });
          }
          throw error;
        }
      }

      // Cas 2 : création/trouvaille du licencié via (licence_number, saison)
      licence_number = normLicence(licence_number);
      saison = normSaison(saison);

      if (!nom || !prenom || !club || !genre || !licence_number || !saison) {
        return res.status(400).json({
          error:
            "Champs requis manquants (nom, prenom, club, genre, licence_number, saison).",
        });
      }
      if (!isValidGenre(genre)) {
        return res.status(400).json({ error: "Le genre doit être 'M' ou 'F'." });
      }
      if (!SAISON_RE.test(saison)) {
        return res.status(400).json({ error: "La saison doit être au format 'YYYY-YYYY'." });
      }

      const [lic, created] = await Licencies.findOrCreate({
        where: { licence_number, saison },
        defaults: { nom, prenom, club, genre, licence_number, saison },
      });

      // Optionnel : mise à jour douce si déjà existant (ne pas effacer des données plus propres)
      if (!created) {
        await lic.update({
          nom: lic.nom || nom,
          prenom: lic.prenom || prenom,
          club: lic.club || club,
          genre: lic.genre || genre,
        });
      }

      licencieId = lic.id;

      try {
        await LicencieEvent.create({ licencie_id: licencieId, event_id: eventId });
        return res.status(201).json({ ok: true, licencie_id: licencieId, event_id: eventId });
      } catch (error) {
        if (error?.name === "SequelizeUniqueConstraintError") {
          return res.status(200).json({ ok: true, alreadyRegistered: true });
        }
        throw error;
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /* =========================
     DELETE — Désinscrire d’un event
     ========================= */
  // DELETE /api/events/:eventId/registrations/:licencieId
  unregisterFromEvent: async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const licencieId = parseInt(req.params.licencieId, 10);

      if (!eventId || !licencieId) {
        return res.status(400).json({ error: "Paramètres invalides." });
      }

      const count = await LicencieEvent.destroy({
        where: { event_id: eventId, licencie_id: licencieId },
      });

      if (count === 0) {
        return res.status(404).json({ error: "Inscription introuvable." });
      }
      res.json({ success: true });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /* =========================
     GET — Licenciés inscrits à un event
     ========================= */
  // GET /api/events/:eventId/registrations
  listLicenciesForEvent: async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      if (!eventId) {
        return res.status(400).json({ error: "eventId invalide." });
      }

      const rows = await LicencieEvent.findAll({
        where: { event_id: eventId },
        include: [
          {
            model: Licencies,
            as: "Licencie",
            attributes: ["id", "nom", "prenom", "club", "genre", "licence_number", "saison"],
          },
        ],
        order: [[{ model: Licencies, as: "Licencie" }, "prenom", "ASC"]],
      });

      const list = rows.map((r) => ({
        id: r.licencie_id,
        ...((r.Licencie && r.Licencie.toJSON && r.Licencie.toJSON()) || r.Licencie || {}),
      }));

      res.json(list);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /* =========================
     GET — Events d’un licencié
     ========================= */
  // GET /api/licencies/:licencieId/events
  listEventsForLicencie: async (req, res) => {
    try {
      const licencieId = parseInt(req.params.licencieId, 10);
      if (!licencieId) {
        return res.status(400).json({ error: "licencieId invalide." });
      }

      const rows = await LicencieEvent.findAll({
        where: { licencie_id: licencieId },
        include: [{ model: Event, as: "Event" }],
        order: [[{ model: Event, as: "Event" }, "start", "ASC"]],
      });

      const events = rows
        .map((r) => r.Event)
        .filter(Boolean)
        .map((e) => (e.toJSON ? e.toJSON() : e));

      res.json(events);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = licencieEventController;
