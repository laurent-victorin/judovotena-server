// controllers/expenseDistanceController.js
const {
  computeDrivingDistance,
} = require("./../services/orsService");

const sequelize = require("../database");
const errorController = require("./errorController");

const expenseDistanceController = {
  getExpenseDrivingDistance: async (req, res) => {
    try {
      const { originAddress, destinationAddress } = req.body || {};

      const result = await computeDrivingDistance({
        originAddress: String(originAddress || "").trim(),
        destinationAddress: String(destinationAddress || "").trim(),
      });

      res.json(result);
    } catch (error) {
      console.error(
        "getExpenseDrivingDistance error:",
        error?.response?.data || error,
      );
      res.status(400).json({
        message:
          error?.response?.data?.error?.message ||
          error.message ||
          "Erreur lors du calcul de distance.",
      });
    }
  },
};

module.exports = expenseDistanceController;
