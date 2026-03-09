const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ExpenseClaimAttachment = sequelize.define(
  "ExpenseClaimAttachment",
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

    expense_claim_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "expense_claim_item_db",
        key: "id",
      },
    },

    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    public_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    original_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    mime_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    size_bytes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    uploaded_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "expense_claim_attachment_db",
    timestamps: false,
  }
);

module.exports = ExpenseClaimAttachment;
