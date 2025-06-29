const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Choice = sequelize.define(
  "Choice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "questions_db", key: "id" },
    },
    choice_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "choices_db",
    timestamps: false,
  }
);

module.exports = Choice;
