const Group = require("../models/Group");
const Acteurs = require("../models/Acteurs");
const ActeurGroup = require("../models/ActeurGroup");
const sequelize = require("../database");
const errorController = require("./errorController");
const { Op } = require("sequelize");

const groupController = {
  // GET allgroups pour HomePage (filtre tous les groupes sauf enseignants et bureau et groupes inactifs)*
  getAllGroupsHome: async (req, res, next) => {
    try {
      const groupes = await Group.findAll({
        where: {
          nom: {
            [Op.notIn]: ["Enseignant", "Bureau"], // Utilise Op.notIn pour exclure les groupes
          },
          is_active: true, // Exclure les groupes inactifs
        },
        order: [["ordre_groupe", "ASC"]],
      });
      res.json(groupes);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour récuprér le nombre de groupes pour HeaderCount exlure les groupes enseignants et bureau et les groupes inactifs
  getGroupCount: async (req, res, next) => {
    try {
      const groupes = await Group.count({
        where: {
          nom: {
            [Op.notIn]: ["Enseignant", "Bureau"], // Utilise Op.notIn pour exclure les groupes
          },
          is_active: true, // Exclure les groupes inactifs
        },
        order: [["ordre_groupe", "ASC"]],
      });
      res.json(groupes);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction tous les groupes y compris enseignants et bureau pour les messages groupés
  // je ne veux récupérer que le nom du groupe et son id
  getAllGroupsMessage: async (req, res, next) => {
    try {
      const groupes = await Group.findAll({
        attributes: ["id", "nom"],
        order: [["ordre_groupe", "ASC"]],
      });
      res.json(groupes);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour trouver les groupes d'un adhérent avec AdherentGroup
  findGroup: async (req, res) => {
    const { id } = req.params;

    try {
      const adherent = await Adherent.findByPk(id, {
        include: [
          {
            model: Group,
            through: {
              attributes: [], // Ne pas récupérer d'attributs de la table de jointure
            },
            as: "Groups", // Alias pour l'association
            attributes: ["nom"], // Récupérer uniquement le nom du groupe
          },
        ],
        logging: console.log,
      });

      if (!adherent) {
        return res.status(404).json({ message: "Adhérent non trouvé" });
      }

      const groupNames = adherent.Groups.map((group) => group.nom);
      res.json({ groupNames });
    } catch (error) {
      console.error("Erreur lors de la recherche des groupes:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  },

  // Route pour trouver le nom d'un groupe par son id
  getGroupNameById: async (req, res) => {
    const { id } = req.params;

    try {
      const group = await Group.findByPk(id, {
        attributes: ["nom"],
      });

      if (!group) {
        return res.status(404).json({ message: "Groupe non trouvé" });
      }

      res.json(group);
    } catch (error) {
      console.error("Erreur lors de la recherche du groupe:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  },

  // Fonction pour faire la liste des groupes (id, nom, nombreAdherents)
  listGroup: async (req, res) => {
    try {
      const groupes = await Group.findAll({
        include: [
          {
            model: Acteurs,
            as: "Acteurs",
            attributes: ["id", "nom", "prenom"],
            through: { attributes: [] },
          },
        ],
        attributes: {
          include: [
            [
              sequelize.fn("COUNT", sequelize.col("Acteurs.id")),
              "nombreActeurs",
            ],
          ],
        },
        order: [["ordre_groupe", "ASC"]],
        group: ["Group.id"],
      });
      res.json(groupes);
    } catch (error) {
      console.error("Erreur lors de la récupération des groupes:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  },

  // Fonction pour faire la liste des groupes uniquement des commissions
  // excepté groupe : "Membres de Commissions"
  // affiche tous les acteurs de chaque commission
  listGroupCommission: async (req, res) => {
    try {
      const groupes = await Group.findAll({
        where: {
          nom: {
            [Op.like]: "%Commission%",
            [Op.not]: "Membres de Commissions",
          },
        },
        include: [
          {
            model: Acteurs,
            as: "Acteurs",
            attributes: ["id", "nom", "prenom", "photo_url"],
            through: {
              model: ActeurGroup,
              attributes: ["is_responsable", "poste"], // Inclure is_responsable et poste
            },
          },
        ],
        order: [["ordre_groupe", "ASC"]],
      });

      const groupesWithActorCount = groupes.map((group) => {
        const nombreActeurs = group.Acteurs ? group.Acteurs.length : 0;
        return {
          ...group.toJSON(),
          nombreActeurs,
        };
      });

      res.json(groupesWithActorCount);
    } catch (error) {
      console.error("Erreur lors de la récupération des groupes:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  },

  // Fonction pour faire la liste des groupes actifs (id, nom, nombreAdherents)
  listGroupActive: async (req, res) => {
    try {
      const groupes = await Group.findAll({
        where: {
          is_active: true,
        },
        include: [
          {
            model: Adherent,
            as: "Adherents",
            attributes: ["id", "nom", "prenom"],
            through: { attributes: [] },
          },
        ],
        attributes: {
          include: [
            [
              sequelize.fn("COUNT", sequelize.col("Adherents.id")),
              "nombreAdherents",
            ],
          ],
        },
        order: [["ordre_groupe", "ASC"]],
        group: ["Group.id"],
      });
      res.json(groupes);
    } catch (error) {
      console.error("Erreur lors de la récupération des groupes:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  },

  ////////////////////////////////////////

  getAllGroupsForFilter: async (req, res, next) => {
    try {
      const groupes = await Group.findAll({});
      res.json(groupes);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  getAllGroups: async (req, res, next) => {
    try {
      const groups = await Group.findAll({
        include: [
          {
            model: Adherent,
            as: "Adherents",
            attributes: ["id", "nom", "prenom"],
            through: { attributes: [] },
          },
        ],
        attributes: {
          include: [
            [
              sequelize.fn("COUNT", sequelize.col("Adherents.id")),
              "nombreAdherents",
            ],
          ],
        },
        order: [["ordre_groupe", "ASC"]],
        group: ["Group.id"],
      });
      res.json(groups);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  addGroup: async (req, res, next) => {
    const {
      nom,
      is_active,
      ordre_groupe,
      color_groupe,
      photo_url,
      description,
    } = req.body;
    try {
      const newGroup = await Group.create({
        nom,
        is_active,
        ordre_groupe,
        color_groupe,
        photo_url,
        description,
      });
      res.status(201).json(newGroup);
    } catch (error) {
      errorController._400(error, req, res);
    }
  },

  updateGroup: async (req, res, next) => {
    const { id } = req.params;
    const {
      nom,
      is_active,
      ordre_groupe,
      color_groupe,
      photo_url,
      description,
    } = req.body;
    try {
      const group = await Group.findByPk(id);
      if (group) {
        await group.update({
          nom,
          is_active,
          ordre_groupe,
          color_groupe,
          photo_url,
          description,
        });
        res.send("Groupe mis à jour avec succès");
      } else {
        res.status(404).send("Groupe non trouvé");
      }
    } catch (error) {
      res.status(500).send("Erreur lors de la mise à jour du groupe");
    }
  },

  // Mettre à jour l'ordre des groupes
  updateOrderGroup: async (req, res, next) => {
    const { groups } = req.body; // On s'attend à recevoir un tableau de groupes avec leurs nouveaux ordres

    const transaction = await Group.sequelize.transaction();
    try {
      for (const group of groups) {
        await Group.update(
          { ordre_groupe: group.ordre_groupe },
          { where: { id: group.id }, transaction }
        );
      }
      await transaction.commit();
      res.send("Ordre des groupes mis à jour avec succès");
    } catch (error) {
      await transaction.rollback();
      errorController._500(error, req, res);
    }
  },

  // Activer ou désactiver un groupe
  activateGroup: async (req, res, next) => {
    const { id } = req.params;
    try {
      const group = await Group.findByPk(id);
      if (group) {
        await group.update({ is_active: !group.is_active });
        res.send("Groupe activé/désactivé avec succès");
      } else {
        errorController._404(error, req, res);
      }
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  removeGroup: async (req, res, next) => {
    const { id } = req.params;
    try {
      await Group.destroy({ where: { id } });
      res.send("Groupe supprimé");
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = groupController;
