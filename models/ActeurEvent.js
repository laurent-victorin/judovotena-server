const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ActeurEvent = sequelize.define(
  "ActeurEvent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    acteur_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "acteurs_db",
        key: "id",
      },
    },

    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "event_db",
        key: "id",
      },
    },

    is_validate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    note: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },

    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    poste: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    tapis: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    response_status: {
      type: DataTypes.ENUM("accepted", "rejected", "pending"),
      allowNull: false,
      defaultValue: "pending",
    },

    response_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },

    need_transport_support: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },

    need_accommodation_support: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },

    support_request_comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    support_requested_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },

    transport_support_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: true,
      defaultValue: null,
    },

    accommodation_support_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: true,
      defaultValue: null,
    },
    attendance_status: {
      type: DataTypes.ENUM("present", "absent", "unknown"),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "acteur_event_db",
    timestamps: false,
  },
);

module.exports = ActeurEvent;
