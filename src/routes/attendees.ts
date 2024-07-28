const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/jwt");

const {
  getEvents,
  applyToEvent,
  appliedEvent,
  setReminder,
} = require("../controllers/attendees");

router.route("/").get(getEvents);
router.route("/:id/apply").post(verifyToken, applyToEvent);
router.route("/applied").get(verifyToken, appliedEvent);
router.route("/:id/attendee/reminder").post(verifyToken, setReminder);

module.exports = router;
