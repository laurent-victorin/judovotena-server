const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // Assurez-vous que le chemin vers votre fichier de connexion à la base de données est correct

const ActeurEvent = sequelize.define(
  "ActeurEvent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    acteur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "acteurs_db", // Nom de la table d'adhérents
        key: "id",
      },
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "event_db", // Nom de la table d'événements
        key: "id",
      },
    },
    is_validate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    note: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null, // ou une valeur par défaut spécifique
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    poste:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    response_status: {
      type: DataTypes.ENUM("accepted", "rejected", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },
    response_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "acteur_event_db",
    timestamps: false,
  }
);

module.exports = ActeurEvent;
