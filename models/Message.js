const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // Assurez-vous que ce chemin est correct

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_db", // Nom de la table des utilisateurs
        key: "id", // Clé primaire dans la table des utilisateurs
      },
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_db",
        key: "id",
      },
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read_message: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_copy: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "message_db",
    timestamps: false, // Désactivez la gestion automatique des colonnes createdAt et updatedAt
  }
);

module.exports = Message;
