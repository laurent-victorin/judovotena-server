const express = require("express");
const router = express.Router();
const ClubController = require("../controllers/ClubController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Route pour obtenir tous les clubs
router.get("/api/clubs/allclubs", cw(ClubController.getClubs));

// Compter le nombre de clubs
router.get("/api/clubs/countclubs", cw(ClubController.countClubs));

// Route pour obtenir un club par ID
router.get("/api/clubs/:id", cw(ClubController.getClubById));

// Route pour obtenir le club d'un utilisateur
router.get("/api/clubs/user/:id", cw(ClubController.getClubByUserId));


/// POST
// Route pour créer un club
router.post("/api/clubs/createclub", cw(ClubController.createClub));

/// PUT
// Route pour mettre à jour un club
router.put("/api/clubs/updateclub/:id", cw(ClubController.updateClub));

/// DELETE
// Route pour supprimer un club
router.delete("/api/clubs/deleteclub/:id", cw(ClubController.deleteClub));

module.exports = router;
