const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ResetPwd = sequelize.define(
  "ResetPwd",
  {
    reset_pwd_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reset_pwd_user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users", // Assure-toi que ceci correspond à la façon dont Sequelize a nommé la table pour le modèle Users
        key: "user_id",
      },
    },
    token: {
      type: DataTypes.STRING,
    },
    expiration_date: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "reset_pwd_db", // Corrigé ici
    timestamps: false,
  }
);

module.exports = ResetPwd;
