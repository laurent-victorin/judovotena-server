const Club = require("../models/Club");
const Users = require("../models/Users");

const ClubController = {
  /// GET
  // Fonction pour obtenir tous les clubs et récupères également les utilisateurs associés (nom, prenom) avec user_id
  getClubs: async (req, res) => {
    try {
      const clubs = await Club.findAll({
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["nom", "prenom"],
          },
        ],
      });
      res.json(clubs);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  // Fonction pour compter le nombre de clubs
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

  // Fonction pour obtenir un club par ID
  getClubById: async (req, res) => {
    try {
      const club = await Club.findByPk(req.params.id);
      res.json(club);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  // Fonction pour obtenir le club d'un utilisateur
  getClubByUserId: async (req, res) => {
    try {
      const club = await Club.findOne({ where: { user_id: req.params.id } });
      res.json(club);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  /// POST
  // Fonction pour créer un club
  createClub: async (req, res) => {
    try {
      const club = await Club.create(req.body); // ⬅️ pas besoin de req.body.user_id
      res.json(club);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la création", error });
    }
  },

  /// PUT
  // Fonction pour mettre à jour un club
  updateClub: async (req, res) => {
    try {
      const club = await Club.findByPk(req.params.id);
      if (!club) {
        return res.status(404).json({ message: "Club non trouvé" });
      }
      await club.update(req.body);
      res.json(club);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  /// DELETE
  // Fonction pour supprimer un club
  deleteClub: async (req, res) => {
    try {
      const club = await Club.findByPk(req.params.id);
      if (!club) {
        return res.status(404).json({ message: "Club non trouvé" });
      }
      await club.destroy();
      res.json({ message: "Club supprimé" });
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = ClubController;
