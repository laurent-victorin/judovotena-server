const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // Adaptez le chemin selon votre configuration

const Annonces = sequelize.define(
  "Annonces",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_db", // Nom de la table des utilisateurs
        key: "id", // Clé primaire dans la table des utilisateurs
      },
    },
    club_user: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tel_user: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    mail_user: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    date_annonce: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "annonces_db",
    timestamps: false, // Désactivez la gestion automatique des colonnes createdAt et updatedAt
  }
);

module.exports = Annonces;