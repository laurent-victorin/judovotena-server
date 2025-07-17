const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // Adaptez le chemin selon votre configuration

const ReglementArbitrage = sequelize.define(
  "ReglementArbitrage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lien_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lien_url_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "reglement_arbitrage_db",
    timestamps: false, // Désactivez la gestion automatique des colonnes createdAt et updatedAt
  }
);

module.exports = ReglementArbitrage;
