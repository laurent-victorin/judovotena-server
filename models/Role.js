const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: DataTypes.STRING,
    description: DataTypes.STRING,
  },
  {
    tableName: "roles_db",
    timestamps: false,
  }
);

module.exports = Role;
