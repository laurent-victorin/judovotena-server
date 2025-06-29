const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Ballot = sequelize.define(
  "Ballot",
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
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "questions_db", key: "id" },
    },
    choice_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "choices_db", key: "id" },
    },
    answer_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users_db", key: "id" },
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ballots_db",
    timestamps: false,
  }
);

module.exports = Ballot;
