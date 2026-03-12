const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const cw = require("../controllers/controllerWrapper");

/// GET
// Fonction allgroups pour HomePage (filtre tous les groupes sauf enseignants et bureau)
router.get("/api/group/allgroupsHome", cw(groupController.getAllGroupsHome));

// Fonction pour récupérér le nombre de groupes pour HeaderCount exlure les groupes enseignants et bureau
router.get("/api/group/groupCount", cw(groupController.getGroupCount));

// Fonction tous les groupes y compris enseignants et bureau pour les messages groupés
router.get(
  "/api/group/allgroupsMessage",
  cw(groupController.getAllGroupsMessage)
);

// Route pour trouver le nom d'un groupe par son id
router.get(
  "/api/group/getGroupNameById/:id",
  cw(groupController.getGroupNameById)
);

// Fonction pour trouver le groupe d'un adhérent
router.get("/api/group/findGroup/:id", cw(groupController.findGroup));

// Fonction pour faire la liste des groupes
router.get("/api/group/listGroup", cw(groupController.listGroup));

// Fonction pour faire la liste des groupes des Commissions
router.get("/api/group/listGroupCommissions", cw(groupController.listGroupCommission));

// Fonction pour faire la liste des groupes actifs
router.get("/api/group/listGroupActive", cw(groupController.listGroupActive));

/// POST
// Fonction pour ajouter un groupe
router.post("/api/group/addGroup", cw(groupController.addGroup));

/// PUT
// Fonction pour mettre à jour un groupe
router.put("/api/group/updateGroup/:id", cw(groupController.updateGroup));

// Fonction pour activer ou désactiver un groupe
router.put("/api/group/activateGroup/:id", cw(groupController.activateGroup));

// Fonction pour mettre à jour l'ordre d'un groupe
router.put("/api/group/updateOrderGroup", cw(groupController.updateOrderGroup));

/// DELETE
// Fonction pour supprimer un groupe
router.delete("/api/group/removeGroup/:id", cw(groupController.removeGroup));

//////////////////////////////////////////////////////////

router.get("/api/groupesfilter", cw(groupController.getAllGroupsForFilter));
router.get("/api/group", cw(groupController.getAllGroups));

module.exports = router;
