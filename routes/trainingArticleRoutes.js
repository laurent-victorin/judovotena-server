// src/routes/trainingArticleRoutes.js
const express = require("express");
const router = express.Router();
const { upload, memoryUpload } = require("../services/multer-config");

const trainingArticleController = require("../controllers/trainingArticleController");

// ⚠️ adapte ces imports à ton projet (même pattern que events)
const cw = require("../controllers/controllerWrapper");

router.get("/api/training-articles", cw(trainingArticleController.getAll));
router.get("/api/training-articles/:id", cw(trainingArticleController.getOne));

router.post("/api/training-articles", cw(trainingArticleController.create));
router.put("/api/training-articles/:id", cw(trainingArticleController.update));
router.delete(
  "/api/training-articles/:id",
  cw(trainingArticleController.remove),
);

router.patch(
  "/api/training-articles/:id/publish",
  cw(trainingArticleController.setPublished),
);

// Upload photo (1..3) — même principe que events
router.patch(
  "/api/training-articles/:id/photo/:slot",
  upload("/LIGUENA/training-articles").single("image"),
  cw(trainingArticleController.updatePhoto),
);

module.exports = router;
