const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Users = sequelize.define(
  "Users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Le nom ne peut pas être vide",
        },
      },
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Le prénom ne peut pas être vide",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Le format de l'email est invalide",
        },
        notEmpty: {
          msg: "L'email ne peut pas être vide",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Le rôle doit être un entier",
        },
        notEmpty: {
          msg: "Le rôle ne peut pas être vide",
        },
      },
      references: {
        model: "roles_db",
        key: "id",
      },
    },
    photoURL: DataTypes.STRING,
    createdOn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users_db",
    timestamps: false,
  }
);

module.exports = Users;
