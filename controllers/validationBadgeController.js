// controllers/validationBadgeController.js
const fs = require("fs");
const path = require("path");
const ValidationBadge = require("../models/ValidationBadge");
const Users = require("../models/Users");
const Club = require("../models/Club");
const errorController = require("./errorController");

// Normalise un chemin disque -> chemin web "uploads/..."
const toWebPath = (p) =>
  String(p)
    .replace(/\\/g, "/")
    .replace(/^.*\/uploads\//, "uploads/");

// Convertit une URL/chemin web -> chemin disque absolu
const fileFromUrl = (urlLike) => {
  const rel = String(urlLike || "").replace(/^\//, "");
  return path.join(__dirname, "..", rel);
};

const validationBadgeController = {
  /// GET
  // Tous les badges
  getAll: async (req, res, next) => {
    try {
      const rows = await ValidationBadge.findAll({
        order: [["id", "DESC"]],
        include: [
          {
            model: Users,
            as: "User",
            attributes: ["id", "nom", "prenom", "email"],
          },
          { model: Club, as: "Club", attributes: ["id", "nom_club"] },
        ],
      });
      res.json(rows);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Par user_id
  getByUser: async (req, res, next) => {
    try {
      const user_id = parseInt(req.params.user_id, 10);
      const rows = await ValidationBadge.findAll({
        where: { user_id },
        order: [["validation_date", "DESC"]],
        include: [{ model: Club, as: "Club", attributes: ["id", "nom_club"] }],
      });
      res.json(rows);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Par club_id
  getByClub: async (req, res, next) => {
    try {
      const club_id = parseInt(req.params.club_id, 10);
      const rows = await ValidationBadge.findAll({
        where: { club_id },
        order: [["validation_date", "DESC"]],
        include: [
          {
            model: Users,
            as: "User",
            attributes: ["id", "nom", "prenom", "email"],
          },
        ],
      });
      res.json(rows);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Créer un badge (upload PDF requis: champ "badge")
  add: async (req, res, next) => {
    try {
      const { user_id, club_id, validation_date } = req.body;

      let badge_url = null;
      if (req.file && req.file.path) {
        badge_url = toWebPath(req.file.path); // ex: 'uploads/validationbadge/xxx.pdf'
      }
      if (!badge_url) {
        return res
          .status(400)
          .json({ error: "Le fichier PDF (badge) est obligatoire." });
      }

      const created = await ValidationBadge.create({
        user_id,
        club_id,
        badge_url,
        validation_date, // 'YYYY-MM-DD'
      });

      res.status(201).json(created);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Mettre à jour un badge (peut remplacer le PDF)
  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const found = await ValidationBadge.findByPk(id);
      if (!found) return res.status(404).json({ error: "Badge introuvable." });

      const { user_id, club_id, validation_date } = req.body;

      // Nouveau fichier ?
      let new_badge_url = found.badge_url;
      if (req.file && req.file.path) {
        const incoming = toWebPath(req.file.path);
        if (found.badge_url && found.badge_url !== incoming) {
          const oldDiskPath = fileFromUrl(found.badge_url);
          try {
            if (fs.existsSync(oldDiskPath)) fs.unlinkSync(oldDiskPath);
          } catch (_) {}
        }
        new_badge_url = incoming;
      }

      await found.update({
        user_id: user_id ?? found.user_id,
        club_id: club_id ?? found.club_id,
        validation_date: validation_date ?? found.validation_date,
        badge_url: new_badge_url,
      });

      res.json(found);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Supprimer un badge (et le PDF local)
  remove: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const found = await ValidationBadge.findByPk(id);
      if (!found) return res.status(404).json({ error: "Badge introuvable." });

      if (found.badge_url) {
        const diskPath = fileFromUrl(found.badge_url);
        try {
          if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
        } catch (_) {}
      }

      await found.destroy();
      res.json({ success: true });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = validationBadgeController;
