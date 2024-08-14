"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
router.get("/check-status", authController.checkAuthStatus);
module.exports = router;
