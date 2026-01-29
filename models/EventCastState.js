// src/models/EventCastState.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const EventCastState = sequelize.define(
  "EventCastState",
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

    mode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "MATS", // MATS | MESSAGE
    },

    active_message_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    updated_by_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "event_cast_state_db",
    timestamps: false,
    indexes: [
      { name: "idx_event", fields: ["event_id"] },
      { name: "uq_event_state", unique: true, fields: ["event_id"] },
    ],
  }
);

module.exports = EventCastState;
