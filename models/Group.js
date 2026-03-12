const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Group = sequelize.define(
  "Group",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: DataTypes.STRING,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ordre_groupe: DataTypes.INTEGER,
    color_groupe: DataTypes.STRING,
    photo_url: DataTypes.STRING,
    description: DataTypes.STRING,
  },
  {
    tableName: "group_db",
    timestamps: false,
  }
);

module.exports = Group;
