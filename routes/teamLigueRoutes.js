const express = require("express");
const router = express.Router();
const TeamLigueController = require("../controllers/TeamLigueController");
const cw = require("../controllers/controllerWrapper");

/// GET
router.get("/api/teamligue/all", cw(TeamLigueController.getAllTeamLigue));
router.get("/api/teamligue/:id", cw(TeamLigueController.getTeamMemberById));
router.get("/api/teamligue/bycommission/:commission_id", cw(TeamLigueController.getTeamByCommission));
router.get("/api/teamligue/count", cw(TeamLigueController.countTeamMembers));

/// POST
router.post("/api/teamligue/create", cw(TeamLigueController.createTeamMember));

/// PUT
router.put("/api/teamligue/update/:id", cw(TeamLigueController.updateTeamMember));

/// DELETE
router.delete("/api/teamligue/delete/:id", cw(TeamLigueController.deleteTeamMember));

module.exports = router;
