const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Club = sequelize.define(
  "Club",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER, // Utilise un ID utilisateur (entier)
      allowNull: true,
      references: {
        model: "Users", // Nom de la table utilisateur
        key: "id", // Clé primaire de la table utilisateur
      },
    },
    nom_club: {
      type: DataTypes.STRING, // Nom du club
      allowNull: false,
    },

    logo_url: {
      type: DataTypes.STRING, // URL de l'image du club
      allowNull: true,
    },
    departement_club: {
      type: DataTypes.STRING, // Département du club
      allowNull: false,
    },
    adresse_club: {
      type: DataTypes.STRING, // Adresse du club
      allowNull: false,
    },
    tel_club: {
      type: DataTypes.STRING, // Numéro de téléphone du club
    },
    email_club: {
      type: DataTypes.STRING, // Email du club
    },
    numero_club: {
      type: DataTypes.STRING, // Numéro du club
    },
    coordonnees_gps: DataTypes.STRING,
  },

  {
    tableName: "club_db",
    timestamps: false,
  }
);

module.exports = Club;
