const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Visites = sequelize.define(
  "Visites",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date_visite: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    compteur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Initialisé à 0
    },
  },
  {
    sequelize,
    modelName: "Visites",
    tableName: "visites_db",
    timestamps: false,
  }
);

module.exports = Visites;
