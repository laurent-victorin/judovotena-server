const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Vote = sequelize.define(
  "Vote",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // 'vote' ou 'sondage'
    allowed_roles: { type: DataTypes.JSON, allowNull: true },
  },
  {
    tableName: "votes_db",
    timestamps: true,
  }
);

module.exports = Vote;
