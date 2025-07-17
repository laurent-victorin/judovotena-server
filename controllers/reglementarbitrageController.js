const Sequelize = require("sequelize");
const ReglementArbitrage = require("../models/ReglementArbitrage");
const errorController = require("./errorController");
const sequelize = require("../database");

const reglementarbitrageController = {
  /// GET
  // Afficher tous les reglements arbitrage
  getAllReglementsArbitrage: async (req, res, next) => {
    try {
      const reglementsarbitrage = await ReglementArbitrage.findAll();
      res.json(reglementsarbitrage);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Créer un reglement arbitrage
  addReglementArbitrage: async (req, res, next) => {
    try {
      const { title, content, lien_url, lien_url_image } = req.body;
      const reglementarbitrage = await ReglementArbitrage.create({
        title,
        content,
        lien_url,
        lien_url_image,
      });
      res.json(reglementarbitrage);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Modifier un reglement arbitrage
  updateReglementArbitrage: async (req, res, next) => {
    try {
      const { title, content, lien_url, lien_url_image } = req.body;
      const reglementarbitrage = await ReglementArbitrage.update(
        {
          title,
          content,
          lien_url,
          lien_url_image,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );
      res.json(reglementarbitrage);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Supprimer un reglement arbitrage
  deleteReglementArbitrage: async (req, res, next) => {
    try {
      const reglementarbitrage = await ReglementArbitrage.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.json(reglementarbitrage);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = reglementarbitrageController;