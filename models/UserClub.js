// models/UserClub.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const UserClub = sequelize.define(
  "UserClub",
  {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    club_id: { type: DataTypes.INTEGER, allowNull: false },
    role_in_club: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "member",
    },
  },
  {
    tableName: "user_clubs_db", // adapte si ton nom est différent
    timestamps: false, // <-- important : pas de createdAt/updatedAt
    underscored: true,
    indexes: [{ unique: true, fields: ["user_id", "club_id"] }],
  }
);

module.exports = UserClub;
