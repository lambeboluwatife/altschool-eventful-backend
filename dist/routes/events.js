"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const multerConfig_1 = require("../config/multerConfig");
const { verifyToken } = require("../middlewares/jwt");
const { getEvents, getSingleEvent, searchEvents, addEvent, deleteEvent, } = require("../controllers/events");
router.route("/").get(getEvents);
router.route("/:id").get(getSingleEvent);
router.route("/search-events").post(searchEvents);
router
    .route("/create-event")
    .post(verifyToken, multerConfig_1.upload.single("backdrop"), addEvent);
router.route("/:id/delete").delete(verifyToken, deleteEvent);
module.exports = router;
