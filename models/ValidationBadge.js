// /models/ValidationBadge.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ValidationBadge = sequelize.define(
  "ValidationBadge",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users_db", key: "id" },
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "club_db", key: "id" },
    },
    badge_url: {
      type: DataTypes.STRING,
      allowNull: false, // chemin/URL vers le PDF déposé
      validate: {
        notEmpty: { msg: "L’URL du badge ne peut pas être vide." },
      },
    },
    validation_date: {
      type: DataTypes.DATEONLY, // date de validité / validation
      allowNull: false,
    },
  },
  {
    tableName: "validation_badges_db",
    timestamps: false,
  }
);

module.exports = ValidationBadge;
