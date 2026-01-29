// src/models/EventBroadcastMessage.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const EventBroadcastMessage = sequelize.define(
  "EventBroadcastMessage",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    event_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "INFO", // INFO | ALERT | PODIUM | CALL ...
    },

    title: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    target_mat_number: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true, // null = global, sinon 1..10
    },

    severity: {
      type: DataTypes.STRING(20),
      allowNull: true, // INFO/WARN/URGENT...
    },

    is_pinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    starts_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    ends_at: {
      type: DataTypes.DATE,
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
    tableName: "event_broadcast_message_db",
    timestamps: false,
    indexes: [
      { name: "idx_event_id", fields: ["event_id"] },
      { name: "idx_target", fields: ["event_id", "target_mat_number"] },
      { name: "idx_active", fields: ["event_id", "is_active", "is_pinned"] },
    ],
  }
);

module.exports = EventBroadcastMessage;
