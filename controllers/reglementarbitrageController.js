const Sequelize = require("sequelize");
const ReglementArbitrage = require("../models/ReglementArbitrage");
const errorController = require("./errorController");
const sequelize = require("../database");

const reglementarbitrageController = {
  /// GET
  // Afficher tous les règlements arbitrage triés par ordre d'affichage
  getAllReglementsArbitrage: async (req, res, next) => {
    try {
      const reglementsarbitrage = await ReglementArbitrage.findAll({
        order: [
          ["display_order", "ASC"],
          ["id", "ASC"],
        ],
      });

      res.json(reglementsarbitrage);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// POST
  // Créer un règlement arbitrage
  addReglementArbitrage: async (req, res, next) => {
    try {
      const { title, content, lien_url, lien_url_image, display_order } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          message: "Les champs title et content sont obligatoires.",
        });
      }

      let finalOrder = display_order;

      if (
        finalOrder === undefined ||
        finalOrder === null ||
        finalOrder === ""
      ) {
        const maxOrder = await ReglementArbitrage.max("display_order");
        finalOrder = Number.isFinite(maxOrder) ? maxOrder + 1 : 1;
      }

      const reglementarbitrage = await ReglementArbitrage.create({
        title,
        content,
        lien_url: lien_url || null,
        lien_url_image: lien_url_image || null,
        display_order: Number(finalOrder),
      });

      res.json(reglementarbitrage);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Modifier un règlement arbitrage
  updateReglementArbitrage: async (req, res, next) => {
    try {
      const { title, content, lien_url, lien_url_image, display_order } = req.body;

      const reglement = await ReglementArbitrage.findByPk(req.params.id);

      if (!reglement) {
        return res.status(404).json({
          message: "Règlement introuvable.",
        });
      }

      await reglement.update({
        title: title ?? reglement.title,
        content: content ?? reglement.content,
        lien_url: lien_url ?? reglement.lien_url,
        lien_url_image: lien_url_image ?? reglement.lien_url_image,
        display_order:
          display_order !== undefined && display_order !== null
            ? Number(display_order)
            : reglement.display_order,
      });

      res.json(reglement);
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// DELETE
  // Supprimer un règlement arbitrage
  deleteReglementArbitrage: async (req, res, next) => {
    try {
      const reglement = await ReglementArbitrage.findByPk(req.params.id);

      if (!reglement) {
        return res.status(404).json({
          message: "Règlement introuvable.",
        });
      }

      await reglement.destroy();

      res.json({
        message: "Règlement supprimé avec succès.",
        id: Number(req.params.id),
      });
    } catch (error) {
      errorController._500(error, req, res);
    }
  },

  /// PUT
  // Réordonner toute la liste
  reorderReglementsArbitrage: async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
      const { items } = req.body;
      // format attendu :
      // items: [{ id: 4, display_order: 1 }, { id: 2, display_order: 2 }]

      if (!Array.isArray(items)) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Le body doit contenir un tableau items.",
        });
      }

      for (const item of items) {
        if (!item?.id || item?.display_order === undefined) continue;

        await ReglementArbitrage.update(
          { display_order: Number(item.display_order) },
          {
            where: { id: Number(item.id) },
            transaction,
          }
        );
      }

      await transaction.commit();

      const reglementsarbitrage = await ReglementArbitrage.findAll({
        order: [
          ["display_order", "ASC"],
          ["id", "ASC"],
        ],
      });

      res.json(reglementsarbitrage);
    } catch (error) {
      await transaction.rollback();
      errorController._500(error, req, res);
    }
  },
};

module.exports = reglementarbitrageController;