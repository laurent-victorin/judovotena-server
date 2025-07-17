const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Commissions = sequelize.define(
  "Commissions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_commission: {
      type: DataTypes.STRING, // Nom de la commission
      allowNull: false,
    },
    description_commission: {
      type: DataTypes.STRING, // Description de la commission
      allowNull: true,
    },
    photo_url: {
      type: DataTypes.STRING, // URL de l'image de la commission
      allowNull: false,
    },
  },
  {
    tableName: "commissions_db",
    timestamps: false,
  }

);

module.exports = Commissions;