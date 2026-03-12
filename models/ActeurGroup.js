const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ActeurGroup = sequelize.define(
  "ActeurGroup",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    acteur_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "acteurs_db",
        key: "id",
      },
    },
    group_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "group_db",
        key: "id",
      },
    },
    is_responsable: DataTypes.BOOLEAN,
    poste: DataTypes.STRING,
  },
  {
    tableName: "acteurgroup_db",
    timestamps: false,
  }
);

module.exports = ActeurGroup;
