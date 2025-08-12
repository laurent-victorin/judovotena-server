const Sequelize = require("sequelize");
const Annonces = require("../models/Annonces");
const Users = require("../models/Users");
const errorController = require("./errorController");
const { Op } = require("sequelize");
const sequelize = require("../database");

const annoncesController = {
/// GET
// Afficher toutes les annonces
getAllAnnonces: async (req, res, next) => {
  try {
    const annonces = await Annonces.findAll({
      include: [
        { model: Users, as: "user", attributes: ["nom", "prenom"] },
      ],
      order: [["date_annonce", "DESC"]],
    });
    res.json(annonces);
  } catch (error) {
    errorController._500(error, req, res);
  }
},

/// POST
// Créer une annonce
addAnnonce: async (req, res, next) => {
  try {
    const {
      title,
      content,
      image_url,
      user_id,
      club_user,
      tel_user,
      mail_user,
      category,
      date_annonce,
      is_active,
    } = req.body;
    const annonce = await Annonces.create({
      title,
      content,
      image_url,
      user_id,
      club_user,
      tel_user,
      mail_user,
      category,
      date_annonce,
      is_active: true,
    });
    res.json(annonce);
  } catch (error) {
    errorController._500(error, req, res);
  }
},

/// PUT
// Modifier une annonce
updateAnnonce: async (req, res, next) => {
  try {
    const {
      title,
      content,
      image_url,
      user_id,
      club_user,
      tel_user,
      mail_user,
      category,
      date_annonce,
      is_active,
    } = req.body;
    const annonce = await Annonces.update(
      {
        title,
        content,
        image_url,
        user_id,
        club_user,
        tel_user,
        mail_user,
        category,
        date_annonce,
        is_active,
      },
      {
        where: { id: req.params.id },
      }
    );
    res.json(annonce);
  } catch (error) {
    errorController._500(error, req, res);
  }
},

/// DELETE
// Supprimer une annonce
deleteAnnonce: async (req, res, next) => {
  try {
    const annonce = await Annonces.destroy({
      where: { id: req.params.id },
    });
    res.json(annonce);
  } catch (error) {
    errorController._500(error, req, res);
  }
},
};

module.exports = annoncesController;