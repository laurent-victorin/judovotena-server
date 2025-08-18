const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // Assurez-vous que le chemin vers votre fichier de connexion à la base de données est correct

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titre: DataTypes.STRING,
    description: DataTypes.TEXT,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    type_event: DataTypes.STRING,
    level_event: DataTypes.STRING,
    cate_event: DataTypes.STRING,
    lieu_event: DataTypes.STRING,
    horaire_event: DataTypes.TEXT,
    photo_url: DataTypes.STRING,
    agenda_url: DataTypes.STRING,
    organisateur: DataTypes.STRING,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "event_db",
    timestamps: false, // Mettre à true si vous avez des champs createdAt et updatedAt
  }
);

module.exports = Event;
