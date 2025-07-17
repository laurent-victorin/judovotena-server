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

// 1: "Administrateur",
// 2: "Utilisateur",
// 3: "Dirigeant de Club",
// 4: "Arbitre",
// 5: "Responsable Arbitrage",
// 6: "Membre de la Ligue NA",
