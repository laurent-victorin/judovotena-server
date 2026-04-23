const express = require("express");
const router = express.Router();
const acteurEventController = require("../controllers/acteurEventController");
const cw = require("../controllers/controllerWrapper");

/// GET
router.get(
  "/api/acteursevents/allresults",
  cw(acteurEventController.getAllResults),
);

router.get(
  "/api/acteursevents/getActeursByEventId/:eventId",
  cw(acteurEventController.getActeursByEventId),
);

router.get(
  "/api/acteursevents/getEventsByActeurId/:acteurId",
  cw(acteurEventController.getEventsByActeurId),
);

router.get(
  "/api/acteursevents/myConvocations",
  cw(acteurEventController.getMyConvocations),
);

router.get(
  "/api/acteursevents/getActeurEventById/:acteurId/:eventId",
  cw(acteurEventController.getActeurEventById),
);

router.get(
  "/api/acteursevents/getSupportRequestsByEventId/:eventId",
  cw(acteurEventController.getSupportRequestsByEventId),
);

/// POST
router.post(
  "/api/acteursevents/assignActorToEvent",
  cw(acteurEventController.assignActorToEvent),
);

router.post(
  "/api/acteursevents/syncActorsSelectionForEvent",
  cw(acteurEventController.syncActorsSelectionForEvent),
);

/// PUT
router.put(
  "/api/acteursevents/updateActeurInEvent/:acteurId/:eventId",
  cw(acteurEventController.updateActeurInEvent),
);

router.put(
  "/api/acteursevents/toggleValidation/:acteurId/:eventId",
  cw(acteurEventController.toggleValidation),
);

router.put(
  "/api/acteursevents/respondToConvocation/:eventId",
  cw(acteurEventController.respondToConvocation),
);

router.put(
  "/api/acteursevents/updateAssignment/:acteurId/:eventId",
  cw(acteurEventController.updateAssignment),
);

router.put(
  "/api/acteursevents/updateSupportStatus/:acteurId/:eventId",
  cw(acteurEventController.updateSupportStatus),
);

router.put(
  "/api/acteursevents/updateAttendance/:acteurId/:eventId",
  cw(acteurEventController.updateAttendance),
);

router.put(
  "/api/acteursevents/bulkUpdateAssignments/:eventId",
  cw(acteurEventController.bulkUpdateAssignments),
);

/// DELETE
router.delete(
  "/api/acteursevents/removeActeurFromEvent/:acteurId/:eventId",
  cw(acteurEventController.removeActeurFromEvent),
);

module.exports = router;
