const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Récupérer le token de l'en-tête d'autorisation
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format attendu "Bearer TOKEN"

  if (token == null) return res.sendStatus(401); // Si aucun token n'est fourni, renvoyer une erreur 401

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Si le token est invalide ou expiré, renvoyer une erreur 403

    req.user = user; // Ajouter l'utilisateur décodé à la requête pour un usage ultérieur
    next(); // Passer à la prochaine middleware ou route
  });
};

module.exports = authenticateToken;
