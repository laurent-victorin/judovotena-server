// controllers/licenciesController.js
const { Op } = require("sequelize");
const Licencies = require("../models/Licencies");
const errorController = require("./errorController");

/* Helpers */
const normLicence = (v) => String(v || "").trim().toUpperCase();
const normSaison = (v) => String(v || "").trim();
const SAISON_RE = /^\d{4}-\d{4}$/;

const licenciesController = {
  /// GET
  // Tous les licenciés
  getAll: async (req, res) => {
    try {
      const rows = await Licencies.findAll({
        order: [
          ["nom", "ASC"],
          ["prenom", "ASC"],
          ["saison", "DESC"],
        ],
      });
      res.json(rows);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Par id
  getById: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const row = await Licencies.findByPk(id);
      if (!row) return res.status(404).json({ error: "Licencié introuvable." });
      res.json(row);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Par numéro de licence (dernier en date si plusieurs saisons)
  getByLicenceNumber: async (req, res) => {
    try {
      const licence_number = normLicence(req.params.licence_number);
      if (!licence_number)
        return res.status(400).json({ error: "Numéro de licence requis." });

      const rows = await Licencies.findAll({
        where: { licence_number },
        order: [["saison", "DESC"]],
      });

      if (!rows || rows.length === 0)
        return res.status(404).json({ error: "Aucun enregistrement pour cette licence." });

      res.json(rows[0]); // le plus récent
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Créer un licencié
  add: async (req, res) => {
    try {
      let { nom, prenom, club, genre, licence_number, saison } = req.body;

      licence_number = normLicence(licence_number);
      saison = normSaison(saison);

      if (!nom || !prenom || !club || !genre || !licence_number || !saison) {
        return res.status(400).json({ error: "Champs obligatoires manquants." });
      }
      if (!SAISON_RE.test(saison)) {
        return res
          .status(400)
          .json({ error: "La saison doit être au format 'YYYY-YYYY'." });
      }
      if (!["M", "F"].includes(String(genre))) {
        return res.status(400).json({ error: "Le genre doit être 'M' ou 'F'." });
      }

      const created = await Licencies.create({
        nom,
        prenom,
        club,
        genre,
        licence_number,
        saison,
      });

      res.status(201).json(created);
    } catch (error) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        return res
          .status(409)
          .json({ error: "Cette licence existe déjà pour cette saison." });
      }
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Mettre à jour un licencié
  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const found = await Licencies.findByPk(id);
      if (!found) return res.status(404).json({ error: "Licencié introuvable." });

      let { nom, prenom, club, genre, licence_number, saison } = req.body;

      if (typeof licence_number !== "undefined") licence_number = normLicence(licence_number);
      if (typeof saison !== "undefined") saison = normSaison(saison);

      if (typeof genre !== "undefined" && !["M", "F"].includes(String(genre))) {
        return res.status(400).json({ error: "Le genre doit être 'M' ou 'F'." });
      }
      if (typeof saison !== "undefined" && !SAISON_RE.test(saison)) {
        return res
          .status(400)
          .json({ error: "La saison doit être au format 'YYYY-YYYY'." });
      }

      await found.update({
        nom: typeof nom !== "undefined" ? nom : found.nom,
        prenom: typeof prenom !== "undefined" ? prenom : found.prenom,
        club: typeof club !== "undefined" ? club : found.club,
        genre: typeof genre !== "undefined" ? genre : found.genre,
        licence_number:
          typeof licence_number !== "undefined" ? licence_number : found.licence_number,
        saison: typeof saison !== "undefined" ? saison : found.saison,
      });

      res.json(found);
    } catch (error) {
      if (error?.name === "SequelizeUniqueConstraintError") {
        return res
          .status(409)
          .json({ error: "Conflit d’unicité (licence + saison)." });
      }
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Supprimer un licencié
  remove: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const found = await Licencies.findByPk(id);
      if (!found) return res.status(404).json({ error: "Licencié introuvable." });

      await found.destroy();
      res.json({ success: true });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// GET
  // Check (pour scan code-barres) :
  // /api/licencies/check?licence_number=M10071971VICTO01&saison=2025-2026
  check: async (req, res) => {
    try {
      const licence_number = normLicence(req.query.licence_number);
      const saison = req.query.saison ? normSaison(req.query.saison) : undefined;

      if (!licence_number) {
        return res.status(400).json({ error: "licence_number requis." });
      }
      if (typeof saison !== "undefined" && !SAISON_RE.test(saison)) {
        return res
          .status(400)
          .json({ error: "La saison doit être au format 'YYYY-YYYY'." });
      }

      // Si saison fournie : on vérifie l'existence exacte licence+saison
      if (saison) {
        const row = await Licencies.findOne({ where: { licence_number, saison } });
        return res.json({
          found: !!row,
          saison_ok: !!row, // true si on a bien trouvé la ligne pour cette saison
          saison_scanned: saison,
          licencie: row || null,
          message: row
            ? "Licence trouvée pour la saison indiquée."
            : "Licence absente pour la saison indiquée.",
        });
      }

      // Sinon : on renvoie le dernier enregistrement existant (toutes saisons confondues)
      const rows = await Licencies.findAll({
        where: { licence_number },
        order: [["saison", "DESC"]],
        limit: 1,
      });

      const row = rows[0] || null;
      return res.json({
        found: !!row,
        saison_ok: !!row, // ok = trouvé (à toi de comparer côté front avec la saison cible)
        saison_detected: row?.saison || null,
        licencie: row,
        message: row
          ? `Licence trouvée (saison ${row.saison}).`
          : "Licence non trouvée.",
      });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = licenciesController;
