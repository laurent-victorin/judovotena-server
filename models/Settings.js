const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Settings = sequelize.define(
  "Settings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_club: DataTypes.STRING,
    shortname_club: DataTypes.STRING,
    responsable_club: DataTypes.STRING,
    logo_club: DataTypes.STRING,
    adresse_club: DataTypes.STRING,
    commune_club: DataTypes.STRING,
    tel_club: DataTypes.STRING,
    mail_club: DataTypes.STRING,
    siteweb_club: DataTypes.STRING,
    siret_club: DataTypes.STRING,
    facebook_club: DataTypes.STRING,
    instagram_club: DataTypes.STRING,
    primary_color: DataTypes.STRING,
    autorisation_renouvellement: DataTypes.BOOLEAN,
    saison_active: DataTypes.STRING,
    header_url1: DataTypes.STRING,
    header_texte1: DataTypes.STRING,
    header_url2: DataTypes.STRING,
    header_texte2: DataTypes.STRING,
    about_title: DataTypes.STRING,
    about_content: DataTypes.STRING,
    carrousel_id: DataTypes.INTEGER,
    max_payments: {
      type: DataTypes.INTEGER,
      defaultValue: 3, // Valeur par défaut si besoin
    },
    payment_interval: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // Valeur par défaut si besoin (en mois)
    },
    photo_url_default_lic_cot: DataTypes.STRING,
    display_boutique: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_chat: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_news: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_galerie: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_lexique: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_techniques: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_arbitrage: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_appels: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_todolist: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_coaching: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_heures_enseignants: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_inventaire: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_chat_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    display_messages_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Valeur par défaut si besoin
    },
    reglement_interieur: DataTypes.STRING,
    reglement_interieur_url_header: DataTypes.STRING,
    reglement_interieur_url_firstimage: DataTypes.STRING,
    reglement_interieur_url_secondimage: DataTypes.STRING,
    discipline_nom: DataTypes.STRING,
    discipline_icone: DataTypes.STRING,
    discipline_illustration: DataTypes.STRING,
    discipline_lexique_database: DataTypes.STRING,
    discipline_techniques_database: DataTypes.STRING,
  },
  {
    tableName: "settings_db",
    timestamps: false,
  }
);

module.exports = Settings;
