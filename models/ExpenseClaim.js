const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ExpenseClaim = sequelize.define(
  "ExpenseClaim",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
    },

    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Events", key: "id" },
    },

    code_budgetaire_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "event_budget_code_db", key: "id" },
    },

    statut: {
      type: DataTypes.ENUM(
        "draft",
        "submitted",
        "approved",
        "rejected",
        "paid",
      ),
      allowNull: false,
      defaultValue: "draft",
    },

    /* Trajet */
    trajet_necessaire: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    moyen_transport: {
      type: DataTypes.ENUM("voiture", "train", "transport", "autre"),
      allowNull: true,
    },

    aller_retour: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    depart: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    arrivee: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    distance_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    taux_km: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },

    montant_trajet: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    covoiturage: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    covoiturage_role: {
      type: DataTypes.ENUM("Conducteur", "Passager"),
      allowNull: true,
    },

    covoiturage_nb_passagers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    covoiturage_avec: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    /* Indemnités */
    indemnite_tenue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    indemnite_representation: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    /* Totaux (cache) */
    total_frais: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total_general: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    date_soumission: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    validated_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
    },

    admin_commentaire: {
      type: DataTypes.TEXT,
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
    tableName: "expense_claim_db",
    timestamps: false,
  },
);

module.exports = ExpenseClaim;
