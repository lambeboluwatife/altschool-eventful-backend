const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/jwt");

const {
  getCreatedEvents,
  getSingleEvent,
  getEventApplicants,
  setReminder,
} = require("../controllers/organizers");

router.route("/").get(verifyToken, getCreatedEvents);
router.route("/:id").get(verifyToken, getSingleEvent);
router.route("/:id/applicants").get(verifyToken, getEventApplicants);
router.route("/:id/reminder").post(verifyToken, setReminder);

module.exports = router;
