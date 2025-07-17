const express = require("express");
const router = express.Router();
const ArticlesCommissionsController = require("../controllers/ArticlesCommissionsController");
const cw = require("../controllers/controllerWrapper");

/// GET
router.get("/api/articlescommissions/all", cw(ArticlesCommissionsController.getAllArticles));
router.get("/api/articlescommissions/:id", cw(ArticlesCommissionsController.getArticleById));
router.get("/api/articlescommissions/bycommission/:commission_id", cw(ArticlesCommissionsController.getArticlesByCommission));
router.get("/api/articlescommissions/count", cw(ArticlesCommissionsController.countArticles));

/// POST
router.post("/api/articlescommissions/create", cw(ArticlesCommissionsController.createArticle));

/// PUT
router.put("/api/articlescommissions/update/:id", cw(ArticlesCommissionsController.updateArticle));

/// DELETE
router.delete("/api/articlescommissions/delete/:id", cw(ArticlesCommissionsController.deleteArticle));

module.exports = router;
