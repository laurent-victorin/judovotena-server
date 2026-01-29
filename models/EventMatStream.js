// src/models/EventMatStream.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const EventMatStream = sequelize.define(
  "EventMatStream",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    event_mat_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    provider: {
      type: DataTypes.STRING(20),
      allowNull: true, // YOUTUBE | TWITCH | VIMEO | OTHER
    },

    stream_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    embed_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    title: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },

    is_live: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    updated_by_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    tableName: "event_mat_stream_db",
    timestamps: false,
    indexes: [
      { name: "uq_event_mat_stream", unique: true, fields: ["event_mat_id"] },
      { name: "idx_live", fields: ["is_live"] },
      { name: "idx_updated_by", fields: ["updated_by_user_id"] },
    ],
  }
);

module.exports = EventMatStream;
