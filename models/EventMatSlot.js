// src/models/EventMatSlot.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const EventMatSlot = sequelize.define(
  "EventMatSlot",
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

    slot_index: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false, // 1..3
    },

    label: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    is_active: {
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
  },
  {
    tableName: "event_mat_slot_db",
    timestamps: false,
    indexes: [
      { name: "idx_mat_id", fields: ["event_mat_id"] },
      {
        name: "uq_mat_slot",
        unique: true,
        fields: ["event_mat_id", "slot_index"],
      },
    ],
  }
);

module.exports = EventMatSlot;
