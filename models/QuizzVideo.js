const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // Adaptez le chemin selon votre configuration

const QuizzVideo = sequelize.define(
  "QuizzVideo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_quizz: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    famille_quizz: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    lien_url_video: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    lien_url_image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    decision: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "quizz_video_db",
    timestamps: false, // Désactivez la gestion automatique des colonnes createdAt et updatedAt
  }
);

module.exports = QuizzVideo;