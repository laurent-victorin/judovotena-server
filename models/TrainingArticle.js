// src/models/TrainingArticle.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const TrainingArticle = sequelize.define(
  "TrainingArticle",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    category: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "DIRIGEANTS", // DIRIGEANTS | CERTIF_ASSO
    },

    title: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },

    subtitle: {
      type: DataTypes.STRING(220),
      allowNull: true,
    },

    content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },

    photo_url_1: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    photo_url_2: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    photo_url_3: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    video_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    powerpoint_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    created_by_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    updated_by_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "training_article_db",
    timestamps: false,
    indexes: [
      { name: "idx_category", fields: ["category"] },
      { name: "idx_published", fields: ["category", "is_published"] },
      { name: "idx_sort", fields: ["category", "sort_order"] },
    ],
  }
);

module.exports = TrainingArticle;
