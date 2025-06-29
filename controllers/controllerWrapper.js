module.exports = function controllerWrapper(controller) {
  return async function (req, res, next) {
    try {
      // j'appelle le controller passé en paramètre
      await controller(req, res, next);
    } catch (error) {
      console.error(error);
      // en cas d'erreur, je retourne une 500 `INTERNAL SERVER ERROR`
      res.status(500).json({
        error: "Erreur serveur inatendue. Merci de réessayer.",
      });

      // un autre avantage de centraliser les erreurs ici
      // est de facilement mettre en place d'autres actions
      // (journalisation, envoie de mail…)
    }
  };
};
