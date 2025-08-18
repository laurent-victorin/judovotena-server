const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // Assurez-vous que le chemin est correct

const UsersEvents = sequelize.define(
  "UsersEvents",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Ajouter cette ligne pour faire de user_id une partie de la clé primaire
      references: {
        model: "users_db",
        key: "id",
      },
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Ajouter cette ligne pour faire de event_id une partie de la clé primaire
      references: {
        model: "event_db",
        key: "id",
      },
    },
  },
  {
    tableName: "users_events_db",
    timestamps: false,
  }
);

module.exports = UsersEvents;
