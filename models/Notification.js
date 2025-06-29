const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // Assurez-vous que le chemin vers votre fichier de connexion à la base de données est correct

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Assurez-vous que ce nom correspond bien à votre table des utilisateurs
        key: "id",
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read_notification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notification_db",
    timestamps: false, // Puisque vous gérez manuellement le champ created_at
  }
);

module.exports = Notification;
