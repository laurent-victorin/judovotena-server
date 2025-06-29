const errorController = {
  _400: (errors, req, res) => {
    res.status(400).json({
      type: "Mauvaise requête",
      errors,
    });
  },

  _404: (req, res) => {
    res.status(404).json({
      error: "Ressource non trouvée. Veuillez vérifier l'identifiant fourni.",
    });
  },

  _500: (error, req, res) => {
    console.trace(error);
    res.status(500).json({
      type: "Erreur interne du serveur",
      error: error.toString(),
    });
  },

  middleware: (err, req, res, next) => {
    // Utilisation des méthodes internes en fonction du code d'état de l'erreur
    if (err.status === 400) {
      return errorController._400(err.errors, req, res);
    } else if (err.status === 404) {
      return errorController._404(req, res);
    } else {
      // Pour toutes les autres erreurs, utilisez _500
      return errorController._500(err, req, res);
    }
  },
};

module.exports = errorController;
