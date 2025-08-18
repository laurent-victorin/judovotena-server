const Techniques = require("../models/Techniques");
const errorController = require("./errorController");
const Sequelize = require("sequelize");

const techniqueController = {
  getAllTechniques: async (req, res, next) => {
    try {
      const techniques = await Techniques.findAll();
      res.json(techniques);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour afficher les techniques judo uniquement sans les familles : Kata, Vocabulaire, Les Bases, Ukemi
  getJudoTechniques: async (req, res, next) => {
    try {
      const judoTechniques = await Techniques.findAll({
        where: {
          famille: {
            [Sequelize.Op.notIn]: [
              "Kata",
              "Vocabulaire",
              "Les Bases",
              "Ukemi",
              "Arbitrage",
            ],
          },
        },
      });
      res.json(judoTechniques);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour afficher les techniques judo uniquement sans les familles : Kata, Vocabulaire, Les Bases, Ukemi et Self-Défense
  getJudoTechniquesWithoutSelfDefense: async (req, res, next) => {
    try {
      const judoTechniques = await Techniques.findAll({
        where: {
          famille: {
            [Sequelize.Op.notIn]: [
              "Kata",
              "Vocabulaire",
              "Les Bases",
              "Ukemi",
              "Self Défense",
              "Arbitrage",
            ],
          },
        },
      });
      res.json(judoTechniques);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour afficher uniquement les techniques qui font parti de l'UV2
  getUV2Techniques: async (req, res, next) => {
    try {
      const uv2Techniques = await Techniques.findAll({
        where: {
          uv2: {
            [Sequelize.Op.not]: null,
          },
        },
      });
      res.json(uv2Techniques);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  // Fonction pour afficher uniquement les techniques de la famille Kata
  getKataTechniques: async (req, res, next) => {
    try {
      const kataTechniques = await Techniques.findAll({
        where: {
          famille: "Kata",
        },
      });
      res.json(kataTechniques);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  addTechnique: async (req, res, next) => {
    try {
      const newTechnique = await Techniques.create(req.body);
      res.json(newTechnique);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  updateTechnique: async (req, res, next) => {
    try {
      const technique = await Techniques.findByPk(req.params.id);
      if (!technique) {
        return errorController._404(req, res);
      }
      await technique.update(req.body);
      res.json(technique);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  deleteTechnique: async (req, res, next) => {
    try {
      const technique = await Techniques.findByPk(req.params.id);
      if (!technique) {
        return errorController._404(req, res);
      }
      await technique.destroy();
      res.json({ message: "Technique supprimée avec succès" });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },
};

module.exports = techniqueController;
