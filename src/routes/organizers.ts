const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/jwt");

const {
  getCreatedEvents,
  getSingleEvent,
  getEventApplicants,
  setReminder,
} = require("../controllers/organizers");

router.route("/created").get(verifyToken, getCreatedEvents);
router.route("/created/:id").get(verifyToken, getSingleEvent);
router.route("/:id/applicants").get(verifyToken, getEventApplicants);
router.route("/:id/reminder").post(verifyToken, setReminder);

module.exports = router;
