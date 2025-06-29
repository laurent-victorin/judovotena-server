const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const UserVoteToken = sequelize.define(
  "UserVoteToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    club_name: {
      type: DataTypes.STRING,
    },
    vote_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "votes_db", key: "id" },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    }, // hashé
    has_voted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "user_vote_tokens_db",
    timestamps: true,
  }
);

module.exports = UserVoteToken;
