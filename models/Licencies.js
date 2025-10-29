// models/Licencies.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Licencies = sequelize.define(
  "Licencies",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nom: {
      type: DataTypes.STRING(250),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Le nom ne peut pas être vide" },
      },
    },

    prenom: {
      type: DataTypes.STRING(250),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Le prénom ne peut pas être vide" },
      },
    },

    club: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Le club ne peut pas être vide" },
      },
    },

    genre: {
      type: DataTypes.ENUM("M", "F"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["M", "F"]],
          msg: "Le genre doit être 'M' ou 'F'",
        },
      },
    },

    licence_number: {
      type: DataTypes.STRING(16),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Le numéro de licence est obligatoire" },
      },
      // l'unicité est portée par l'index composite (licence_number, saison)
    },

    saison: {
      type: DataTypes.STRING(9), // ex: "2025-2026"
      allowNull: false,
      validate: {
        notEmpty: { msg: "La saison est obligatoire" },
        len: {
          args: [9, 9],
          msg: "La saison doit être au format 'YYYY-YYYY' (9 caractères).",
        },
      },
    },
  },
  {
    tableName: "licencies_db",
    timestamps: false,
    indexes: [
      // Unicité par licence et saison
      { unique: true, fields: ["licence_number", "saison"], name: "uk_licence_saison" },
      // Aides pour filtres
      { fields: ["saison"], name: "idx_saison" },
      { fields: ["genre"], name: "idx_genre" },
    ],
  }
);

module.exports = Licencies;
