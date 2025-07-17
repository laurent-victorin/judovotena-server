const ArticlesCommissions = require("../models/ArticlesCommissions");
const Commissions = require("../models/Commissions");

const ArticlesCommissionsController = {
  // Obtenir tous les articles avec leur commission
  getAllArticles: async (req, res) => {
    try {
      const articles = await ArticlesCommissions.findAll({
        include: [{ model: Commissions, as: "commission" }],
        order: [["date_article", "DESC"]],
      });
      res.status(200).json(articles);
    } catch (error) {
      console.error("❌ Erreur getAllArticles :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Obtenir un article par ID
  getArticleById: async (req, res) => {
    try {
      const article = await ArticlesCommissions.findByPk(req.params.id, {
        include: [{ model: Commissions, as: "commission" }],
      });

      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }

      res.status(200).json(article);
    } catch (error) {
      console.error("❌ Erreur getArticleById :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Obtenir tous les articles d'une commission
  getArticlesByCommission: async (req, res) => {
    try {
      const articles = await ArticlesCommissions.findAll({
        where: { commission_id: req.params.commission_id },
        include: [{ model: Commissions, as: "commission" }],
        order: [["date_article", "DESC"]],
      });

      res.status(200).json(articles);
    } catch (error) {
      console.error("❌ Erreur getArticlesByCommission :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Compter les articles
  countArticles: async (req, res) => {
    try {
      const total = await ArticlesCommissions.count();
      res.status(200).json({ total });
    } catch (error) {
      console.error("❌ Erreur countArticles :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  },

  // Créer un nouvel article
  createArticle: async (req, res) => {
    try {
      const {
        commission_id,
        titre,
        contenu,
        photo_url1,
        photo_url2,
        photo_url3,
        is_active,
        date_article,
      } = req.body;

      if (!commission_id || !titre || !contenu) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
      }

      const newArticle = await ArticlesCommissions.create({
        commission_id,
        titre,
        contenu,
        photo_url1,
        photo_url2,
        photo_url3,
        is_active: is_active ?? true,
        date_article: date_article ?? new Date(),
      });

      res.status(201).json(newArticle);
    } catch (error) {
      console.error("❌ Erreur createArticle :", error);
      res.status(500).json({ message: "Erreur lors de la création", error });
    }
  },

  // Mettre à jour un article
  updateArticle: async (req, res) => {
    try {
      const article = await ArticlesCommissions.findByPk(req.params.id);

      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }

      await article.update(req.body);
      res.status(200).json(article);
    } catch (error) {
      console.error("❌ Erreur updateArticle :", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour", error });
    }
  },

  // Supprimer un article
  deleteArticle: async (req, res) => {
    try {
      const article = await ArticlesCommissions.findByPk(req.params.id);

      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }

      await article.destroy();
      res.status(200).json({ message: "Article supprimé avec succès" });
    } catch (error) {
      console.error("❌ Erreur deleteArticle :", error);
      res.status(500).json({ message: "Erreur lors de la suppression", error });
    }
  },
};

module.exports = ArticlesCommissionsController;
