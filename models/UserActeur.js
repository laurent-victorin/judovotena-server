const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const UserActeur = sequelize.define(
  "UserActeur",
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users_db", // Nom de la table
        key: "id",
      },
    },
    acteur_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "acteurs_db", // Nom de la table
        key: "id",
      },
    },
  },
  {
    tableName: "user_acteur_db",
    timestamps: false,
  }
);

module.exports = UserActeur;
