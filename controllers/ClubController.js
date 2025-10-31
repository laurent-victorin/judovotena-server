// controllers/ClubController.js
const Club = require("../models/Club");
const Users = require("../models/Users");
const UserClub = require("../models/UserClub"); // <-- table de liaison N↔N
const { Op } = require("sequelize");

const ClubController = {
  /* =========================
   *         GET
   * ========================= */

  // Tous les clubs (avec, si dispo, la liste des membres via pivot)
  getClubs: async (req, res) => {
    try {
      const clubs = await Club.findAll({
        order: [["nom_club", "ASC"]],
        include: [
          {
            model: Users,
            as: "Members",
            attributes: ["id", "nom", "prenom", "photoURL", "role_id", "email"],
            through: { attributes: ["role_in_club"] }, // <-- plus de createdAt/updatedAt
            required: false,
          },
        ],
      });
      res.json(clubs);
    } catch (error) {
      console.error("getClubs error:", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Compter le nombre de clubs
  countClubs: async (req, res) => {
    try {
      const totalClubs = await Club.count();
      return res.status(200).json({ totalClubs });
    } catch (error) {
      console.error("❌ Erreur lors du comptage des clubs :", error);
      return res
        .status(500)
        .json({ message: "Erreur serveur lors du comptage des clubs" });
    }
  },

  // Détail club (inclut les membres si dispo)
  getClubById: async (req, res) => {
    try {
      const club = await Club.findByPk(req.params.id, {
        include: [
          {
            model: Users,
            as: "Members",
            attributes: ["id", "nom", "prenom", "photoURL", "role_id", "email"],
            through: { attributes: ["role_in_club"] }, // <-- idem
            required: false,
          },
        ],
      });
      if (!club) return res.status(404).json({ message: "Club introuvable" });
      res.json(club);
    } catch (error) {
      console.error("getClubById error:", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // LEGACY — renvoie le premier club "legacy" associé par Club.user_id
  // Pour compat, essaie d’abord via pivot (clubs du user), sinon fallback user_id
  getClubByUserId: async (req, res) => {
    try {
      const userId = Number(req.params.id);

      // 1) via pivot: renvoyer le premier club si plusieurs
      const links = await UserClub.findAll({
        where: { user_id: userId },
        include: [{ model: Club }],
        order: [[Club, "nom_club", "ASC"]],
      });
      if (links.length > 0) {
        return res.json(links[0].Club);
      }

      // 2) fallback legacy
      const legacy = await Club.findOne({ where: { user_id: userId } });
      return res.json(legacy || null);
    } catch (error) {
      console.error("getClubByUserId error:", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // NOUVEAU — liste des utilisateurs liés à un club (via pivot)
  getMembersByClub: async (req, res) => {
    try {
      const clubId = Number(req.params.id);

      const club = await Club.findByPk(clubId, {
        include: [
          {
            model: Users,
            as: "Members", // <-- IMPORTANT: alias de Club.belongsToMany(Users, { as: "Members", ... })
            attributes: ["id", "nom", "prenom", "photoURL", "role_id", "email"],
            through: {
              attributes: ["role_in_club"], // récupère le rôle depuis la table pivot
            },
          },
        ],
        order: [[{ model: Users, as: "Members" }, "prenom", "ASC"]],
      });

      const members = (club?.Members || []).map((u) => ({
        id: u.id,
        nom: u.nom,
        prenom: u.prenom,
        photoURL: u.photoURL,
        role_id: u.role_id,
        email: u.email,
        role_in_club: u.UserClub?.role_in_club || "member", // flatten du pivot
      }));

      return res.json(members);
    } catch (error) {
      console.error("getMembersByClub error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // NOUVEAU — clubs d’un utilisateur (via pivot)
  getClubsByUser: async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      const user = await Users.findByPk(userId, {
        include: [
          {
            model: Club,
            as: "Clubs", // <-- IMPORTANT: alias de Users.belongsToMany(Club, { as: "Clubs", ... })
            through: { attributes: ["role_in_club"] },
          },
        ],
        order: [[{ model: Club, as: "Clubs" }, "nom_club", "ASC"]],
      });

      // Si tu veux renvoyer aussi le rôle, décommente ce mapping :
      // const clubs = (user?.Clubs || []).map((c) => ({
      //   ...c.toJSON(),
      //   role_in_club: c.UserClub?.role_in_club || "member",
      // }));
      // return res.json(clubs);

      return res.json(user?.Clubs || []);
    } catch (error) {
      console.error("getClubsByUser error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  /* =========================
   *         POST
   * ========================= */

  // Créer un club (admin only en général)
  createClub: async (req, res) => {
    try {
      const {
        nom_club,
        departement_club,
        adresse_club,
        tel_club,
        email_club,
        logo_url,
        numero_club,
        coordonnees_gps,
        user_id, // peut arriver par erreur depuis un client
      } = req.body;

      // ✅ Vérification minimale : ces 3 champs sont requis
      if (
        !nom_club ||
        String(nom_club).trim() === "" ||
        !departement_club ||
        String(departement_club).trim() === "" ||
        !numero_club ||
        String(numero_club).trim() === ""
      ) {
        return res.status(400).json({
          message:
            "Champs requis manquants : nom_club, departement_club, numero_club.",
        });
      }

      // Remplace les string vides par null pour les champs optionnels
      const nil = (v) =>
        typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v;

      const payload = {
        nom_club: String(nom_club).trim(),
        departement_club: String(departement_club).trim(),
        adresse_club: nil(adresse_club),
        tel_club: nil(tel_club),
        email_club: nil(email_club),
        logo_url: nil(logo_url),
        numero_club: String(numero_club).trim(),
        coordonnees_gps: nil(coordonnees_gps),
        // On force à null si non numérique
        user_id: Number.isInteger(user_id) ? user_id : null,
      };

      const club = await Club.create(payload);
      res.status(201).json(club);
    } catch (error) {
      console.error("createClub error:", error);
      res.status(500).json({ message: "Erreur lors de la création", error });
    }
  },

  // NOUVEAU — lier un utilisateur à un club (id = club_id)
  // Body attendu: { user_id, role_in_club? }
  linkUserToClub: async (req, res) => {
    try {
      const clubId = Number(req.params.id);
      const { user_id, role_in_club = "member" } = req.body;

      if (!user_id) {
        return res.status(400).json({ message: "user_id requis" });
      }

      // Empêche les doublons (index unique user_id/club_id)
      const [row] = await UserClub.findOrCreate({
        where: { user_id, club_id: clubId },
        defaults: { role_in_club },
      });

      if (row.role_in_club !== role_in_club) {
        await row.update({ role_in_club });
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("linkUserToClub error:", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  /* =========================
   *          PUT
   * ========================= */

  updateClub: async (req, res) => {
    try {
      const club = await Club.findByPk(req.params.id);
      if (!club) {
        return res.status(404).json({ message: "Club non trouvé" });
      }
      await club.update(req.body);
      res.json(club);
    } catch (error) {
      console.error("updateClub error:", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // PATCH /api/clubs/:clubId/members/:userId
  updateUserRoleInClub: async (req, res) => {
    try {
      const clubId = Number(req.params.clubId);
      const userId = Number(req.params.userId);
      const { role_in_club } = req.body;

      if (!clubId || !userId) {
        return res
          .status(400)
          .json({ message: "clubId et userId sont requis dans l’URL." });
      }
      if (!role_in_club || typeof role_in_club !== "string") {
        return res.status(400).json({ message: "role_in_club est requis." });
      }

      // (Optionnel) liste blanche des rôles autorisés
      const ALLOWED = [
        "Dirigeant(e)",
        "Enseignant(e)",
        "Coach",
        "Arbitre",
        "Judoka(te) licencié(e) au club",
      ];
      if (!ALLOWED.includes(role_in_club)) {
        return res.status(400).json({ message: "role_in_club invalide." });
      }

      const link = await UserClub.findOne({
        where: { club_id: clubId, user_id: userId },
      });
      if (!link) {
        return res
          .status(404)
          .json({ message: "Lien user ↔ club introuvable." });
      }

      await link.update({ role_in_club });
      return res.json({ ok: true, link });
    } catch (error) {
      console.error("updateUserRoleInClub error:", error);
      return res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  /* =========================
   *        DELETE
   * ========================= */

  deleteClub: async (req, res) => {
    try {
      const club = await Club.findByPk(req.params.id);
      if (!club) {
        return res.status(404).json({ message: "Club non trouvé" });
      }
      await club.destroy();
      res.json({ message: "Club supprimé" });
    } catch (error) {
      console.error("deleteClub error:", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // NOUVEAU — délier un utilisateur d’un club
  unlinkUserFromClub: async (req, res) => {
    try {
      const clubId = Number(req.params.id);
      const userId = Number(req.params.userId);
      await UserClub.destroy({ where: { user_id: userId, club_id: clubId } });
      res.json({ ok: true });
    } catch (error) {
      console.error("unlinkUserFromClub error:", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },
};

module.exports = ClubController;
