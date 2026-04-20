const express = require("express");
const router = express.Router();
const acteurEventController = require("../controllers/acteurEventController");
const cw = require("../controllers/controllerWrapper");
const authenticateToken = require("../middlewares/authenticateToken");

/// GET
router.get(
  "/api/acteursevents/allresults",
  authenticateToken,
  cw(acteurEventController.getAllResults),
);

router.get(
  "/api/acteursevents/getActeursByEventId/:eventId",
  authenticateToken,
  cw(acteurEventController.getActeursByEventId),
);

router.get(
  "/api/acteursevents/getEventsByActeurId/:acteurId",
  authenticateToken,
  cw(acteurEventController.getEventsByActeurId),
);

router.get(
  "/api/acteursevents/myConvocations",
  authenticateToken,
  cw(acteurEventController.getMyConvocations),
);

router.get(
  "/api/acteursevents/getActeurEventById/:acteurId/:eventId",
  authenticateToken,
  cw(acteurEventController.getActeurEventById),
);

router.get(
  "/api/acteursevents/getSupportRequestsByEventId/:eventId",
  authenticateToken,
  cw(acteurEventController.getSupportRequestsByEventId),
);

/// POST
router.post(
  "/api/acteursevents/assignActorToEvent",
  authenticateToken,
  cw(acteurEventController.assignActorToEvent),
);

router.post(
  "/api/acteursevents/syncActorsSelectionForEvent",
  authenticateToken,
  cw(acteurEventController.syncActorsSelectionForEvent),
);

/// PUT
router.put(
  "/api/acteursevents/updateActeurInEvent/:acteurId/:eventId",
  authenticateToken,
  cw(acteurEventController.updateActeurInEvent),
);

router.put(
  "/api/acteursevents/toggleValidation/:acteurId/:eventId",
  authenticateToken,
  cw(acteurEventController.toggleValidation),
);

router.put(
  "/api/acteursevents/respondToConvocation/:eventId",
  authenticateToken,
  cw(acteurEventController.respondToConvocation),
);

router.put(
  "/api/acteursevents/updateAssignment/:acteurId/:eventId",
  authenticateToken,
  cw(acteurEventController.updateAssignment),
);

router.put(
  "/api/acteursevents/updateSupportStatus/:acteurId/:eventId",
  authenticateToken,
  cw(acteurEventController.updateSupportStatus),
);

router.put(
  "/api/acteursevents/updateAttendance/:acteurId/:eventId",
  authenticateToken,
  cw(acteurEventController.updateAttendance),
);

router.put(
  "/api/acteursevents/bulkUpdateAssignments/:eventId",
  authenticateToken,
  cw(acteurEventController.bulkUpdateAssignments),
);

/// DELETE
router.delete(
  "/api/acteursevents/removeActeurFromEvent/:acteurId/:eventId",
  authenticateToken,
  cw(acteurEventController.removeActeurFromEvent),
);

module.exports = router;