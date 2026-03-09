const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const EventBudgetCode = sequelize.define(
  "EventBudgetCode",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    libelle: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "event_budget_code_db",
    timestamps: false,
  },
);

module.exports = EventBudgetCode;
