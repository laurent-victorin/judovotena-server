// Model Sequelize pour la table ContactForm qui contient id, email, nom, message

const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ContactForm = sequelize.define(
  "ContactForm",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    message: DataTypes.STRING,
    read_message: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },

  {
    tableName: "contactform_db",
    timestamps: false,
  }
);

module.exports = ContactForm;
