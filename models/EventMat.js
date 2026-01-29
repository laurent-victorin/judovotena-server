// src/models/EventMat.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const EventMat = sequelize.define(
  "EventMat",
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

    mat_number: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false, // 1..10
    },

    label: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },

    is_open: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    sort_order: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
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
    tableName: "event_mat_db",
    timestamps: false,
    indexes: [
      { name: "idx_event_id", fields: ["event_id"] },
      {
        name: "uq_event_mat",
        unique: true,
        fields: ["event_id", "mat_number"],
      },
    ],
  }
);

module.exports = EventMat;
