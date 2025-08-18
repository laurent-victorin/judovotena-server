const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Techniques = sequelize.define(
  "Techniques",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    famille: { type: DataTypes.STRING },
    ceinture: { type: DataTypes.STRING },
    image1_url: { type: DataTypes.STRING },
    video_url: { type: DataTypes.STRING },
    traduction: { type: DataTypes.STRING },
    information: { type: DataTypes.TEXT },
    uv2: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: "Techniques",
    tableName: "techniques_db",
    timestamps: false,
  }
);

module.exports = Techniques;
