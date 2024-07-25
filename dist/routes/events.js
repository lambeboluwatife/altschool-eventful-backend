"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const multerConfig_1 = require("../config/multerConfig");
const { verifyToken } = require("../middlewares/jwt");
// const { checkEventOwnership } = require("../middlewares/authMiddleware");
const { getEvents, addEvent, getCreatedEvents, getEventApplicants, updateEvent, deleteEvent, } = require("../controllers/events");
router
    .route("/")
    .get(getEvents)
    .post(verifyToken, multerConfig_1.upload.single("backdrop"), addEvent);
router.route("/created").get(verifyToken, getCreatedEvents);
router.route("/:id/applicants").get(verifyToken, getEventApplicants);
router.route("/:id/edit").put(verifyToken, updateEvent);
router.route("/:id").delete(verifyToken, deleteEvent);
module.exports = router;
