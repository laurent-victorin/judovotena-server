const express = require("express");
const cors = require("cors");
const errorController = require("./controllers/errorController");
const userController = require("./controllers/userController");
const adminRoutes = require("./routes/adminRoutes");
const fs = require("fs");
const path = require("path");

require("./models/relations");

const app = express();
const bodyParser = require("body-parser");
const authenticateToken = require("./middlewares/authenticateToken");

app.use(cors());
app.post("/webhook/stripe", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOADS_ROOT || "uploads"))
);

// Importez vos routes
const contactformRoutes = require("./routes/contactformRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const roleRoutes = require("./routes/roleRoutes");
const SettingsRoutes = require("./routes/SettingsRoutes");
const userRoutes = require("./routes/userRoutes");
const visitesRoutes = require("./routes/visitesRoutes");
const clubRoutes = require("./routes/clubRoutes");
const voteRoutes = require("./routes/voteRoutes");
const quizzvideoRoutes = require("./routes/quizzvideoRoutes");
const reglementarbitrageRoutes = require("./routes/reglementarbitrageRoutes");
const commissionRoutes = require("./routes/commissionRoutes");
const articlesCommissionsRoutes = require("./routes/articlesCommissionsRoutes");
const teamLigueRoutes = require("./routes/teamLigueRoutes");
const annoncesRoutes = require("./routes/annoncesRoutes");
const techniqueRoutes = require("./routes/techniqueRoutes");
const usersTechniquesRoutes = require("./routes/usersTechniquesRoutes");
const eventRoutes = require("./routes/eventRoutes");
const usersEventsRoutes = require("./routes/usersEventsRoutes");
const validationBadgeRoutes = require("./routes/validationBadgeRoutes");
const licenciesRoutes = require("./routes/licenciesRoutes");

// Utilisez vos routes
app.use(contactformRoutes);
app.use(messageRoutes);
app.use(notificationRoutes);
app.use(roleRoutes);
app.use(SettingsRoutes);
app.use(userRoutes);
app.use(visitesRoutes);
app.use(clubRoutes);
app.use(voteRoutes);
app.use(quizzvideoRoutes);
app.use(reglementarbitrageRoutes);
app.use(commissionRoutes);
app.use(articlesCommissionsRoutes);
app.use(teamLigueRoutes);
app.use(annoncesRoutes);
app.use(techniqueRoutes);
app.use(usersTechniquesRoutes);
app.use(eventRoutes);
app.use(usersEventsRoutes);
app.use(validationBadgeRoutes);
app.use(licenciesRoutes);

app.use("/admin", adminRoutes);
app.use("/api", userRoutes);

// Routes publiques
app.get("/", (req, res) => res.send("HomePage")); // Simulez la HomePage
app.post("/login", userController.loginUser); // Connexion
app.post("/register", userController.addUser); // Inscription

// Middleware d'authentification appliqué à toutes les routes suivantes
app.use(authenticateToken);

// Middleware pour les erreurs
app.use(errorController.middleware);

// Synchronisation de la base de données et démarrage du serveur
const PORT = process.env.PORT || 9996;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur en écoute sur localhost:${PORT}`);
});
