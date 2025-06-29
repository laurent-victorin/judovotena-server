const Visites = require("../models/Visites");
const errorController = require("./errorController");
const sequelize = require("../database");
const { Op } = require("sequelize");

const visiteController = {
  /// GET
  countVisites: async (req, res, next) => {
    try {
      const visitesCount = await Visites.sum("compteur"); // Calcul de la somme des compteurs
      res.json({ count: visitesCount || 0 }); // Retourne 0 si aucune visite n'existe
    } catch (error) {
      console.error("Erreur lors du comptage total des visites :", error);
      errorController._500(error, req, res);
    }
  },

  // Nouvelle méthode pour compter les visites par date
  countVisitesByDate: async (req, res, next) => {
    try {
      const visites = await Visites.findAll({
        attributes: ["date_visite", "compteur"],
        order: [["date_visite", "ASC"]],
      });

      res.json(visites);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des visites par date:",
        error
      );
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  /// POST
  addVisite: async (req, res, next) => {
    const transaction = await sequelize.transaction(); // Démarrer une transaction
    try {
      const today = new Date().toISOString().split("T")[0]; // Récupération de la date au format YYYY-MM-DD

      // Utilisation de findOrCreate pour garantir une seule insertion
      const [visite, created] = await Visites.findOrCreate({
        where: { date_visite: today },
        defaults: { compteur: 1 }, // Valeurs par défaut si l'entrée n'existe pas
        transaction, // Exécution dans la transaction
      });

      if (!created) {
        // Si l'entrée existe déjà, incrémenter le compteur
        visite.compteur += 1;
        await visite.save({ transaction });
      }

      await transaction.commit(); // Valider la transaction
      res.json({ message: "Visite ajoutée ou mise à jour avec succès" });
    } catch (error) {
      await transaction.rollback(); // Annuler la transaction en cas d'erreur
      console.error("Erreur lors de l'ajout de la visite :", error);
      errorController._500(error, req, res);
    }
  },

  // DELETE
  // Nouvelle méthode pour supprimer des visites sur une période de temps
  deleteVisites: async (req, res, next) => {
    try {
      const { dateDebut, dateFin } = req.body;

      if (!dateDebut || !dateFin) {
        return res.status(400).json({
          error: "Les dates de début et de fin sont obligatoires",
        });
      }

      // Assurez-vous que sequelize.Op est correctement utilisé ici
      await Visites.destroy({
        where: {
          date_visite: {
            [Op.between]: [dateDebut, dateFin], // Utiliser Op.between pour filtrer entre deux dates
          },
        },
      });

      res.json({ message: "Visites supprimées" });
    } catch (error) {
      console.error("Erreur lors de la suppression des visites:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
};

module.exports = visiteController;
