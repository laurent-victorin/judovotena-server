const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const TeamLigue = sequelize.define(
  "TeamLigue",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false, // Nom du membre de l'équipe
    },
    prenom: {
      type: DataTypes.STRING, // Prénom du membre de l'équipe
      allowNull: false,
    },
    photo_url: {
      type: DataTypes.STRING, // URL de la photo du membre de l'équipe
      allowNull: true,
    },
    poste: {
      type: DataTypes.STRING, // Département de l'équipe
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING, // Email du membre de l'équipe
      allowNull: true,
    },
    commission_id: {
      type: DataTypes.INTEGER, // ID de la commission à laquelle l'équipe appartient
      allowNull: true,
      references: {
        model: "Commissions", // Nom de la table Commission
        key: "id", // Clé primaire de la table Commission
      },
    },
    ordre: {
      type: DataTypes.INTEGER, // Ordre d'affichage de l'équipe
      allowNull: false,
    },
  },

  {
    tableName: "team_ligue_db",
    timestamps: false,
  }

);

module.exports = TeamLigue;