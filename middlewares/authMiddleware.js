const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("🔍 Token reçu par le back-end :", req.headers.authorization);

  if (!token) {
    return res.status(403).json({ error: "Accès refusé : Token manquant." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔑 Token décodé :", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Erreur de vérification du token :", error);
    return res.status(403).json({ error: "Token invalide ou expiré." });
  }
};

module.exports = authMiddleware;
