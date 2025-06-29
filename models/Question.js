const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Question = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vote_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "votes_db", key: "id" },
    },
    question_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // 'single' ou 'multiple'
  },
  {
    tableName: "questions_db",
    timestamps: false,
  }
);

module.exports = Question;
