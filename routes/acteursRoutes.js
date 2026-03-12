const express = require("express");
const router = express.Router();
const acteursController = require("../controllers/acteursController");
const cw = require("../controllers/controllerWrapper");
const Users = require("../models/Users");
const { upload } = require("../services/multer-config");

/// GET
// Route pour obtenir la liste (nom, prénom, photo_url ainsi que leur groupe) de tous les adhérents
router.get(
  "/api/acteurs/getAllActeursListWithGroup",
  cw(acteursController.getAllActeursListWithGroup)
);

// Route pour obtenir l'acteur par son id
router.get("/api/acteurs/getActeurById/:id", cw(acteursController.getActeurById));

// Route pour obtenir la liste (nom, prénom) de tous les adhérents
router.get(
  "/api/acteurs/getAllActeursList",
  cw(acteursController.getAllActeursList)
);

// Route pour obtenir la liste des officiels
router.get("/api/acteurs/getOfficiels", cw(acteursController.getOfficiels));

/// POST
// Route pour ajouter un acteur par administrateur
router.post("/api/acteurs/addActeur", cw(acteursController.addActeur));

// Route pour ajouter un acteur par un utilisateur
router.post("/api/acteurs/addActeurByUser", cw(acteursController.addActeurByUser));

// Route pour ajouter un nouveau groupe à un acteur
router.post(
  "/api/acteurs/addGroupe/:id",
  cw(acteursController.addActeurGroupe)
);

/// PUT
// Route pour mettre à jour un acteur existant
router.put("/api/acteurs/updateActeur/:id", cw(acteursController.updateActeur));

// Route pour modifier le groupe d'un acteur
router.put(
  "/api/acteurs/updateActeurGroup/:acteurId/:groupId",
  cw(acteursController.updateActeurGroupe)
);

/// DELETE
// Route pour supprimer un acteur existant
router.delete("/api/acteurs/removeActeur/:id", cw(acteursController.deleteActeur));

// Route pour supprimer un groupe d'un acteur
router.delete(
  "/api/acteurs/removeGroupe/:acteurId/:groupId",
  cw(acteursController.deleteActeurGroupe)
);



//////////////////////////////////////////////////


// Route pour obtenir le nombre total d'adhérents (HomePage)
router.get("/api/acteurs/countActeurs", cw(acteursController.getActeursCount));

// Route pour obtenir le nombre d'enseignants (HomePage)
router.get(
  "/api/adherents/countEnseignants",
  cw(acteursController.getAdherentsCountEnseignants)
);

// Route pour récupérer les enseignants qui sont dans le groupe "Enseignant"
router.get(
  "/api/adherents/getEnseignants",
  cw(acteursController.getEnseignants)
);

// Route pour obtenir les adhérents gérés par l'utilisateur connecté (dashboard inscriptions adhérents)
router.get(
  "/api/adherents/managedByUser/:userId",
  cw(acteursController.getAdherentsManagedByUser)
);

// Route pour obtenir un adhérent spécifique par ID
router.get(
  "/api/adherents/getAllAdherentsById/:id",
  cw(acteursController.getAllAdherentsById)
);





// Route pour obtenir la liste (nom prenom date_naissance photo_url) de tous les adhérents qui sont nés aujourd'hui pour fêter leur anniversaire
router.get(
  "/api/adherents/getBirthdayAdherents",
  cw(acteursController.getBirthdayAdherents)
);

// Route pour obtenir un tableau de tous les adhérents avec leur groupe et leurs utilisateurs associés classés par ordre alphabétique
router.get(
  "/api/adherents/getAllAdherentsWithGroupAndUsers",
  cw(acteursController.getAllAdherentsWithGroupAndUsers)
);

// Route pour obtenir les utilisateurs associés à un adhérent spécifique
router.get(
  "/api/adherents/getUsersByAdherent/:id",
  cw(acteursController.getUsersByAdherent)
);

/// POST
// Route pour ajouter un adhérent
router.post("/api/adherents/addAdherent", cw(acteursController.addAdherent));

/// PATCH
// Route pour mettre à jour la photo d'un adhérent
router.patch(
  "/api/adherents/:id/photo",
  upload("/JUDOGIRONDE/adherents").single("image"),
  cw(acteursController.updateAdherentPhoto)
);

/// PUT
// Route pour mettre à jour le poids d'un adhérent
router.put("/api/adherents/updatePoids/:id", cw(acteursController.updatePoids));

// Route pour mettre à jour les informations d'un adhérent
router.put(
  "/api/adherents/updateAdherent/:id",
  cw(acteursController.updateAdherent2)
);

// Route pour mettre à jour les notes de l'enseignant d'un adhérent
router.put(
  "/api/adherents/updateTeacherNotes/:id",
  cw(acteursController.updateTeacherNotes)
);

// Route pour mettre à jour le groupe d'un adhérent
router.put(
  "/api/adherents/updateAdherentGroup/:id",
  cw(acteursController.updateGroupe)
);

/// POST


/// DELETE
// Route pour supprimer un adhérent existant
router.delete(
  "/api/adherents/removeAdherent/:id",
  cw(acteursController.deleteAdherent)
);

// Route pour supprimer un groupe d'un adhérent
router.delete(
  "/api/adherents/removeGroupe/:adherentId/:groupId",
  cw(acteursController.removeAdherentFromGroup)
);

////////////////////////////////////////////////////////////////

// Route pour obtenir tous les adhérents
router.get("/api/adherents", cw(acteursController.getAllAdherents));

// Route pour obtenir les adhérents gérés par un utilisateur spécifique
router.get(
  "/api/adherents/managedBy/:userId",
  cw(acteursController.getAdherentsManagedByUser)
);

// Route pour mettre à jour un adhérent existant
router.put("/api/adherent/:id", cw(acteursController.updateAdherent));

//
router.get("/api/adherents/byEmail", async (req, res) => {
  const { email } = req.query;
  try {
    // Trouver l'utilisateur par email
    const user = await Users.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Utiliser l'association pour récupérer les adhérents liés à cet utilisateur
    const Acteurs = await user.getAdherents(); // Utilisation de la méthode générée par l'association

    res.json(Acteurs);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des adhérents par email:",
      error
    );
    res.status(500).send("Erreur serveur");
  }
});

// ... ajoutez d'autres routes si nécessaire

module.exports = router;
