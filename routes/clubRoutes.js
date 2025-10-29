const express = require("express");
const router = express.Router();
const ClubController = require("../controllers/ClubController");
const cw = require("../controllers/controllerWrapper");

// --- Clubs (lecture) ---
router.get("/api/clubs", cw(ClubController.getClubs));                 // liste
router.get("/api/clubs/count", cw(ClubController.countClubs));         // compteur
router.get("/api/clubs/:id", cw(ClubController.getClubById));          // détail

// --- Liaison User <-> Club ---
router.get("/api/clubs/:id/members", cw(ClubController.getMembersByClub)); // users d’un club
router.get("/api/users/:userId/clubs", cw(ClubController.getClubsByUser)); // clubs d’un user

// Lier un user à un club  (body: { user_id, role_in_club? })
router.post("/api/clubs/:id/members", cw(ClubController.linkUserToClub));

router.patch("/api/clubs/:clubId/members/:userId", cw(ClubController.updateUserRoleInClub)); // MAJ rôle

// Délier un user d’un club
router.delete("/api/clubs/:id/members/:userId", cw(ClubController.unlinkUserFromClub));

// --- (Optionnel: admin seulement) CRUD Club existant ---
router.post("/api/clubs", cw(ClubController.createClub));
router.put("/api/clubs/:id", cw(ClubController.updateClub));
router.delete("/api/clubs/:id", cw(ClubController.deleteClub));

module.exports = router;
