const express = require("express");
const router = express.Router();
const annoncesController = require("../controllers/annoncesController");
const cw = require("../controllers/controllerWrapper");
const { upload } = require("../services/multer-config");

/// GET
// Route pour afficher toutes les annonces
router.get("/api/annonces/getAllAnnonces", cw(annoncesController.getAllAnnonces));

/// POST
// Route pour créer une annonce
router.post("/api/annonces/addAnnonce", cw(annoncesController.addAnnonce));


/// PUT
// Route pour modifier une annonce
router.put("/api/annonces/updateAnnonce/:id", cw(annoncesController.updateAnnonce));


/// DELETE
// Route pour supprimer une annonce
router.delete("/api/annonces/deleteAnnonce/:id", cw(annoncesController.deleteAnnonce));

module.exports = router;