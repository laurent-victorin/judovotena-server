const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Acteurs = sequelize.define(
  "Acteurs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    email: DataTypes.STRING,
    tel: DataTypes.STRING,
    adresse: DataTypes.STRING,
    cp: DataTypes.STRING,
    commune: DataTypes.STRING,
    genre: DataTypes.STRING,
    date_naissance: {
      type: DataTypes.DATE,
    },
    photo_url: DataTypes.STRING,
    club_acteur: DataTypes.STRING,
    licence_number: DataTypes.STRING,
    groupe_souhaite: DataTypes.TEXT,
    titre_arbitrage: DataTypes.TEXT,
  },
  {
    tableName: "acteurs_db",
    timestamps: false,
  }
);

module.exports = Acteurs;
