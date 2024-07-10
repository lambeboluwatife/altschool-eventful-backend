const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/jwt");
// const { checkEventOwnership } = require("../middlewares/authMiddleware");

const { getEvents, addEvent, deleteEvent } = require("../controllers/events");

router.route("/").get(getEvents).post(verifyToken, addEvent);
// router.route("/:id").get(getEvent);
router.route("/:id").delete(deleteEvent);

module.exports = router;
