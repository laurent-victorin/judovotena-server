const express = require("express");
const router = express.Router();
const quizzvideoController = require("../controllers/quizzvideoController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Route pour récupérer tous les quizz
router.get(
  "/api/quizzvideo/allQuizz",
  cw(quizzvideoController.getAllQuizz)
);

/// POST
// Route pour ajouter un quizz
router.post(
  "/api/quizzvideo/addQuizz",
  cw(quizzvideoController.addQuizz)
);

/// PUT
// Route pour modifier un quizz par son id
router.put(
  "/api/quizzvideo/updateQuizz/:id",
  cw(quizzvideoController.updateQuizz)
);

/// DELETE
// Route pour supprimer un quizz par son id
router.delete(
  "/api/quizzvideo/deleteQuizz/:id",
  cw(quizzvideoController.deleteQuizz)
);

module.exports = router;