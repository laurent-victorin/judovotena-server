const Sequelize = require("sequelize");
const QuizzVideo = require("../models/QuizzVideo");
const errorController = require("./errorController");


const quizzvideoController = {
  /// GET
  // Afficher tous les quizz
  getAllQuizz: async (req, res, next) => {
    try {
      const quizzvideo = await QuizzVideo.findAll();
      res.json(quizzvideo);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Créer un quizz
  addQuizz: async (req, res, next) => {
    try {
      const {
        nom_quizz,
        famille_quizz,
        lien_url_video,
        lien_url_image,
        decision,
        description,
      } = req.body;
      const quizzvideo = await QuizzVideo.create({
        nom_quizz,
        famille_quizz,
        lien_url_video,
        lien_url_image,
        decision,
        description,
      });
      res.json(quizzvideo);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Modifier un quizz
  updateQuizz: async (req, res, next) => {
    try {
      const {
        nom_quizz,
        famille_quizz,
        lien_url_video,
        lien_url_image,
        decision,
        description,
      } = req.body;
      const quizzvideo = await QuizzVideo.update(
        {
          nom_quizz,
          famille_quizz,
          lien_url_video,
          lien_url_image,
          decision,
          description,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      );
      res.json(quizzvideo);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Supprimer un quizz
  deleteQuizz: async (req, res, next) => {
    try {
      const { id } = req.params;
      const quizzvideo = await QuizzVideo.destroy({
        where: {
          id,
        },
      });
      res.json(quizzvideo);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

};

module.exports = quizzvideoController;