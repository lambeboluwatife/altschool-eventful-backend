const express = require("express");
const router = express.Router();

import { upload } from "../config/multerConfig";
const { verifyToken } = require("../middlewares/jwt");
// const { checkEventOwnership } = require("../middlewares/authMiddleware");

const {
  getEvents,
  addEvent,
  getCreatedEvents,
  deleteEvent,
} = require("../controllers/events");

router
  .route("/")
  .get(getEvents)
  .post(verifyToken, upload.single("backdrop"), addEvent);
router.route("/created").get(getCreatedEvents);
// router.route("/:id").get(getEvent);
router.route("/:id").delete(deleteEvent);

module.exports = router;
