"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwt");
const { generateTicket, scanTicket } = require("../controllers/tickets");
router.route("/:id/generate-ticket").post(verifyToken, generateTicket);
router.route("/scan-ticket").post(verifyToken, scanTicket);
module.exports = router;
