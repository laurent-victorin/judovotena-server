const { DataTypes } = require("sequelize");
const sequelize = require("../database");

/**
 * Table de liaison entre Licencies et Event
 * Colonnes: id (PK), licencie_id (FK), event_id (FK)
 * Unicité: (licencie_id, event_id)
 */
const LicencieEvent = sequelize.define(
  "LicencieEvent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    licencie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        // on référence les tables physiques pour éviter les imports croisés
        model: "licencies_db",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "event_db",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "licencie_events_db",
    timestamps: false,
    underscored: true, // => colonnes licencie_id / event_id
    indexes: [
      {
        unique: true,
        fields: ["licencie_id", "event_id"],
        name: "uk_licencie_event",
      },
      { fields: ["event_id"], name: "idx_event_id" },
      { fields: ["licencie_id"], name: "idx_licencie_id" },
    ],
  }
);

module.exports = LicencieEvent;
