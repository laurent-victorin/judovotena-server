const { DataTypes } = require("sequelize");
const sequelize = require("../database");

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
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "reglement_arbitrage_db",
    timestamps: false,
  }
);

module.exports = ReglementArbitrage;