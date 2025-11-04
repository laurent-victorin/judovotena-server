// models/ResultsEvent.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // adapte le chemin si besoin

const ResultsEvent = sequelize.define(
  "ResultsEvent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Identifiant d'origine de l'évènement (pas de contrainte FK volontairement)
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Infos recopiées depuis l'Event au moment de la création du résultat
    titre: DataTypes.STRING,
    start: DataTypes.DATE,
    type_event: DataTypes.STRING,
    level_event: DataTypes.STRING,
    cate_event: DataTypes.STRING,
    lieu_event: DataTypes.STRING,
    organisateur: DataTypes.STRING,

    // Liens vers les documents de résultats
    rapport_url: DataTypes.TEXT,       // PDF/URL du rapport
    tableaux_url: DataTypes.TEXT,      // PDF/URL des tableaux
    selection_url: DataTypes.TEXT,     // PDF/URL de la sélection
    photospodium_url: DataTypes.TEXT,  // URL album photos podium
  },
  {
    tableName: "results_event_db",
    timestamps: false, // passe à true si tu veux createdAt/updatedAt
    indexes: [
      { fields: ["event_id"] },
      { fields: ["start"] },
    ],
  }
);

module.exports = ResultsEvent;
