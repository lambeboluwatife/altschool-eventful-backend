"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/users");
const { generateToken } = require("../middlewares/jwt");
router.route("/login").post(loginUser, generateToken);
router.route("/register").post(registerUser);
module.exports = router;
