const Sequelize = require("sequelize");
const Acteurs = require("../models/Acteurs");
const Users = require("../models/Users");
const UserActeur = require("../models/UserActeur");
const ActeurGroup = require("../models/ActeurGroup");
const Group = require("../models/Group");
const errorController = require("./errorController");
const { Op } = require("sequelize");
const sequelize = require("../database");

const acteursController = {
  /// GET
  // Route pour obtenir la liste (nom, prénom, photo_url ainsi que leur groupe) de tous les adhérents
  getAllActeursListWithGroup: async (req, res, next) => {
    try {
      const acteurs = await Acteurs.findAll({
        include: [
          {
            model: Users,
            as: "Users",
            attributes: ["nom", "prenom", "photoURL"],
          },
          {
            model: Group,
            as: "Groups",
            attributes: ["id", "nom"],
          },
        ],
        order: [["nom", "ASC"]],
      });
      res.json(acteurs);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour obtenir l'acteur par son id
  // on y ajoutera son ou ses groupes
  getActeurById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const acteur = await Acteurs.findByPk(id, {
        include: [
          {
            model: Group,
            as: "Groups",
            attributes: ["id", "nom"],
          },
        ],
      });
      res.json(acteur);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Route pour obtenir la liste (nom, prénom) de tous les adhérents
  getAllActeursList: async (req, res, next) => {
    try {
      const acteurs = await Acteurs.findAll({
        attributes: ["id", "nom", "prenom"],
        order: [["nom", "ASC"]],
      });
      res.json(acteurs);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Route pour obtenir la liste des Officiels = acteurs ayant un titre d'arbitrage avec les groupes de 1 à 6
  getOfficiels: async (req, res, next) => {
    try {
      const acteurs = await Acteurs.findAll({
        where: {
          titre_arbitrage: {
            [Op.not]: null,
          },
        },
        include: [
          {
            model: Group,
            as: "Groups",
            where: {
              id: {
                [Op.between]: [1, 6],
              },
            },
            attributes: ["id", "nom"],
          },
        ],
        order: [["nom", "ASC"]],
      });
      res.json(acteurs);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Route pour ajouter un acteur
  addActeur: async (req, res, next) => {
    try {
      const {
        nom,
        prenom,
        email,
        tel,
        adresse,
        cp,
        commune,
        genre,
        date_naissance,
        photo_url,
        club_acteur,
        licence_number,
        groupe_souhaite,
      } = req.body;
      const acteur = await Acteurs.create({
        nom,
        prenom,
        email,
        tel,
        adresse,
        cp,
        commune,
        genre,
        date_naissance,
        photo_url,
        club_acteur,
        licence_number,
        groupe_souhaite,
      });
      res.json(acteur);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour créer un nouvel acteur par un utilisateur et lié cet acteur avec user avec UserActeur
  addActeurByUser: async (req, res, next) => {
    try {
      const {
        nom,
        prenom,
        email,
        tel,
        adresse,
        cp,
        commune,
        genre,
        date_naissance,
        photo_url,
        club_acteur,
        licence_number,
        groupe_souhaite,
        user_id,
      } = req.body;

      // Vérifiez si l'utilisateur existe
      const user = await Users.findByPk(user_id);
      if (!user) {
        return res.status(404).send("Utilisateur non trouvé");
      }

      // Créer un nouvel acteur
      const acteur = await Acteurs.create({
        nom,
        prenom,
        email,
        tel,
        adresse,
        cp,
        commune,
        genre,
        date_naissance,
        photo_url,
        club_acteur,
        licence_number,
        groupe_souhaite,
      });

      // Créer une relation entre l'utilisateur et l'acteur
      await UserActeur.create({ user_id, acteur_id: acteur.id });

      res.json(acteur);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Route pour ajouter un nouveau groupe à un acteur
  addActeurGroupe: async (req, res, next) => {
    const { id } = req.params;
    const { group_id, is_responsable, poste } = req.body;

    try {
      const acteur = await Acteurs.findByPk(id);
      if (acteur) {
        // Vérifiez si le groupe existe
        const group = await Group.findByPk(group_id);
        if (!group) {
          return res.status(404).send("Groupe non trouvé");
        }

        // Ajouter le groupe à l'adhérent
        await ActeurGroup.create({ acteur_id: id, group_id, is_responsable, poste });

        res.send("Groupe ajouté avec succès");
      } else {
        errorController._404(req, res);
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Route pour mettre à jour un acteur
  updateActeur: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        nom,
        prenom,
        email,
        tel,
        adresse,
        cp,
        commune,
        genre,
        date_naissance,
        photo_url,
        club_acteur,
        licence_number,
        groupe_souhaite,
      } = req.body;
      const acteur = await Acteurs.update(
        {
          nom,
          prenom,
          email,
          tel,
          adresse,
          cp,
          commune,
          genre,
          date_naissance,
          photo_url,
          club_acteur,
          licence_number,
          groupe_souhaite,
        },
        { where: { id } }
      );
      res.json(acteur);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Controller pour mettre à jour le groupe d'un acteur
  updateActeurGroupe: async (req, res, next) => {
    const { acteurId, groupId } = req.params;
    const { is_responsable, poste } = req.body;

    try {
      const acteur = await Acteurs.findByPk(acteurId);
      if (acteur) {
        // Vérifiez si le groupe existe
        const group = await Group.findByPk(groupId);
        if (!group) {
          return res.status(404).send("Groupe non trouvé");
        }

        // Mettre à jour le groupe de l'acteur
        await ActeurGroup.update(
          { is_responsable, poste },
          { where: { acteur_id: acteurId, group_id: groupId } }
        );

        res.send("Groupe mis à jour avec succès");
      } else {
        errorController._404(req, res);
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Route pour supprimer un acteur
  deleteActeur: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;

      // Supprime les relations avec les utilisateurs
      await UserActeur.destroy({
        where: { acteur_id: id },
        transaction,
      });

      // Supprime les relations avec les groupes
      await ActeurGroup.destroy({
        where: { acteur_id: id },
        transaction,
      });

      // Supprime l'acteur
      const acteur = await Acteurs.destroy({ where: { id }, transaction });

      await transaction.commit();

      res.json({ message: "Acteur supprimé avec succès", acteur });
    } catch (error) {
      await transaction.rollback();
      console.error("Erreur lors de la suppression de l'acteur :", error);
      errorController._500(error, req, res);
    }
  },

  /// Route pour supprimer un groupe d'un acteur
  deleteActeurGroupe: async (req, res, next) => {
    const { acteurId, groupId } = req.params; // Utilisez les noms de paramètres corrects

    try {
      const acteur = await Acteurs.findByPk(acteurId);
      if (acteur) {
        // Vérifiez si le groupe existe
        const group = await Group.findByPk(groupId);
        if (!group) {
          return res.status(404).send("Groupe non trouvé");
        }

        // Supprimer le groupe de l'acteur
        await ActeurGroup.destroy({
          where: { acteur_id: acteurId, group_id: groupId },
        });

        res.send("Groupe supprimé avec succès");
      } else {
        errorController._404(req, res);
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = acteursController;
