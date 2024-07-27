const express = require("express");
const router = express.Router();

import { upload } from "../config/multerConfig";
const { verifyToken } = require("../middlewares/jwt");

const {
  addEvent,
  getCreatedEvents,
  getSingleEvent,
  getEventApplicants,
  deleteEvent,
} = require("../controllers/events");

router.route("/").post(verifyToken, upload.single("backdrop"), addEvent);
router.route("/created").get(verifyToken, getCreatedEvents);
router.route("/created/:id").get(verifyToken, getSingleEvent);
router.route("/:id/applicants").get(verifyToken, getEventApplicants);
router.route("/:id").delete(verifyToken, deleteEvent);

module.exports = router;
