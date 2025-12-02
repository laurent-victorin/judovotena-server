// controllers/validationBadgeController.js
const fs = require("fs");
const path = require("path");
const ValidationBadge = require("../models/ValidationBadge");
const Users = require("../models/Users");
const Club = require("../models/Club");
const errorController = require("./errorController");
const { QueryTypes } = require("sequelize");
const sequelize = require("../database");

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

  listUsersWithBadgesSimple: async (req, res) => {
    try {
      const q = String(req.query.q || "")
        .trim()
        .toLowerCase();
      const departement = String(req.query.departement || "").trim();
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(
        200,
        Math.max(1, parseInt(req.query.limit, 10) || 50)
      );
      const offset = (page - 1) * limit;

      // 1) Dernier badge par utilisateur (1 ligne par user)
      //    => rapide si index (user_id, validation_date)
      const latestBadges = await sequelize.query(
        `
        SELECT vb.user_id, vb.badge_url, vb.validation_date
        FROM validation_badges_db vb
        JOIN (
          SELECT user_id, MAX(validation_date) AS max_date
          FROM validation_badges_db
          GROUP BY user_id
        ) x ON x.user_id = vb.user_id AND x.max_date = vb.validation_date
        `,
        { type: QueryTypes.SELECT }
      );

      if (!latestBadges.length) {
        return res.json({ items: [], total: 0, page, limit });
      }

      const badgeByUser = new Map();
      const userIds = [];
      for (const row of latestBadges) {
        badgeByUser.set(row.user_id, {
          badge_url: row.badge_url,
          validation_date: row.validation_date,
        });
        userIds.push(row.user_id);
      }

      // 2) Récupère les utilisateurs + leurs clubs (avec role_in_club depuis le pivot)
      const users = await Users.findAll({
        where: { id: userIds },
        attributes: ["id", "nom", "prenom", "email", "photoURL"],
        include: [
          {
            model: Club,
            as: "Clubs",
            attributes: ["id", "nom_club", "departement_club"],
            through: { attributes: ["role_in_club"] }, // <-- récupère le rôle club
          },
        ],
        order: [
          ["nom", "ASC"],
          ["prenom", "ASC"],
        ],
      });

      // Mise en forme + filtres simples côté Node
      const normalizedIncludes = (txt) =>
        (txt || "")
          .toString()
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase();

      let items = users.map((u) => {
        const plain = u.get({ plain: true });

        // Rôles uniques depuis le pivot
        const rolesSet = new Set();

        const clubs = (plain.Clubs || []).map((c) => {
          const role = c?.UserClub?.role_in_club || null;
          if (role) rolesSet.add(role);
          return {
            id: c.id,
            name: c.nom_club,
            departement: c.departement_club,
            role_in_club: role, // pratique si on veut afficher rôle par club
          };
        });

        return {
          id: plain.id,
          nom: plain.nom,
          prenom: plain.prenom,
          email: plain.email,
          photoURL: plain.photoURL,
          clubs,
          primaryRoles: Array.from(rolesSet), // <-- rôles agrégés
          badge: badgeByUser.get(plain.id) || null, // toujours défini ici
        };
      });

      // Filtre comité/département (si fourni)
      if (departement) {
        items = items.filter((u) =>
          u.clubs.some((c) => (c.departement || "") === departement)
        );
      }

      // Filtre recherche 'q' (nom/prénom/email/nom_club/rôles)
      if (q) {
        items = items.filter((u) => {
          const hay = [
            `${u.prenom} ${u.nom}`,
            u.email,
            ...u.clubs.map((c) => c.name),
            ...(u.primaryRoles || []),
          ]
            .filter(Boolean)
            .map(normalizedIncludes)
            .join(" ");
          const needle = normalizedIncludes(q);
          return hay.includes(needle);
        });
      }

      const total = items.length;
      const paged = items.slice(offset, offset + limit);

      return res.json({ items: paged, total, page, limit });
    } catch (error) {
      console.error(error);
      // on reste cohérent avec ton handler d'erreurs
      return res.status(500).json({
        error: "Erreur serveur lors du chargement des utilisateurs avec badge.",
      });
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
