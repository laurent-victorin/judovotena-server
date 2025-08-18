const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // Assurez-vous que le chemin est correct

const UsersTechniques = sequelize.define(
  "UsersTechniques",
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
    technique_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Ajouter cette ligne pour faire de technique_id une partie de la clé primaire
      references: {
        model: "techniques_db",
        key: "id",
      },
    },
  },
  {
    tableName: "users_techniques_db",
    timestamps: false,
  }
);

module.exports = UsersTechniques;
