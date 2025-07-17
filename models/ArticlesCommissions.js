const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ArticlesCommissions = sequelize.define(
  "ArticlesCommissions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    commission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "commissions_db",
        key: "id",
      },
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    photo_url1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    photo_url2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    photo_url3: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    date_article: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "articles_commissions_db",
    timestamps: false,
  }
);

module.exports = ArticlesCommissions;