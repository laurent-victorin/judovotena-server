const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ExpenseClaimItem = sequelize.define(
  "ExpenseClaimItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    expense_claim_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "expense_claim_db",
        key: "id",
      },
    },

    type: {
      type: DataTypes.ENUM("peage", "repas", "hebergement", "parking", "autre"),
      allowNull: false,
    },

    date_frais: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    montant: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    description: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: "expense_claim_item_db",
    timestamps: false,
  }
);

module.exports = ExpenseClaimItem;
