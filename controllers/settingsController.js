const Settings = require("../models/Settings");

const settingsController = {
  getSettings: async (req, res) => {
    try {
      const settings = await Settings.findAll();
      res.json(settings);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des paramètres" });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const settings = await Settings.update(req.body, {
        where: {
          id: 1,
        },
      });
      res.json(settings);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour des paramètres" });
    }
  },

  updateDefaultImageLicence: async (req, res) => {
    const imageUrl = req.file ? req.file.path : null;
    try {
      const settings = await Settings.findByPk(1); // Récupérez l'instance des paramètres avec l'ID 1
      if (settings) {
        settings.photo_url_default_lic_cot = imageUrl;
        await settings.save(); // Enregistrez les modifications
        res.json({ imageUrl });
      } else {
        res.status(404).send("Paramètres non trouvés");
      }
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la mise à jour de l'image par défaut",
      });
    }
  },

  updateLogoClub: async (req, res) => {
    const imageUrl = req.file ? req.file.path : null;
    try {
      const settings = await Settings.findByPk(1); // Récupérez l'instance des paramètres avec l'ID 1
      if (settings) {
        settings.logo_club = imageUrl;
        await settings.save(); // Enregistrez les modifications
        res.json({ imageUrl });
      } else {
        res.status(404).send("Paramètres non trouvés");
      }
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la mise à jour du logo du club",
      });
    }
  },

  // Mettre à jour l'image header_url1
  updateFirstHeaderImage: async (req, res) => {
    const imageUrl = req.file ? req.file.path : null;
    try {
      const settings = await Settings.findByPk(1); // Récupérez l'instance des paramètres avec l'ID 1
      if (settings) {
        settings.header_url1 = imageUrl;
        await settings.save(); // Enregistrez les modifications
        res.json({ imageUrl });
      } else {
        res.status(404).send("Paramètres non trouvés");
      }
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la mise à jour de l'image header_url1",
      });
    }
  },

  // Mettre à jour l'image header_url2
  updateSecondHeaderImage: async (req, res) => {
    const imageUrl = req.file ? req.file.path : null;
    try {
      const settings = await Settings.findByPk(1); // Récupérez l'instance des paramètres avec l'ID 1
      if (settings) {
        settings.header_url2 = imageUrl;
        await settings.save(); // Enregistrez les modifications
        res.json({ imageUrl });
      } else {
        res.status(404).send("Paramètres non trouvés");
      }
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la mise à jour de l'image header_url2",
      });
    }
  },

  // Mettre à jour l'image header
  updateReglementHeaderImage: async (req, res) => {
    const imageUrl = req.file ? req.file.path : null;
    try {
      const settings = await Settings.findByPk(1); // Récupérez l'instance des paramètres avec l'ID 1
      if (settings) {
        settings.reglement_interieur_url_header = imageUrl;
        await settings.save(); // Enregistrez les modifications
        res.json({ imageUrl });
      } else {
        res.status(404).send("Paramètres non trouvés");
      }
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la mise à jour de l'image header",
      });
    }
  },

  // Mettre à jour la première image facultative
  updateReglementFirstImage: async (req, res) => {
    const imageUrl = req.file ? req.file.path : null;
    try {
      const settings = await Settings.findByPk(1); // Récupérez l'instance des paramètres avec l'ID 1
      if (settings) {
        settings.reglement_interieur_url_firstimage = imageUrl;
        await settings.save(); // Enregistrez les modifications
        res.json({ imageUrl });
      } else {
        res.status(404).send("Paramètres non trouvés");
      }
    } catch (error) {
      res.status(500).json({
        message:
          "Erreur lors de la mise à jour de la première image facultative",
      });
    }
  },

  // Mettre à jour la deuxième image facultative
  updateReglementSecondImage: async (req, res) => {
    const imageUrl = req.file ? req.file.path : null;
    try {
      const settings = await Settings.findByPk(1); // Récupérez l'instance des paramètres avec l'ID 1
      if (settings) {
        settings.reglement_interieur_url_secondimage = imageUrl;
        await settings.save(); // Enregistrez les modifications
        res.json({ imageUrl });
      } else {
        res.status(404).send("Paramètres non trouvés");
      }
    } catch (error) {
      res.status(500).json({
        message:
          "Erreur lors de la mise à jour de la deuxième image facultative",
      });
    }
  },
};

module.exports = settingsController;
