const express = require("express");
const router = express.Router();

const { registerUser, loginUser, logoutUser } = require("../controllers/users");
const { generateToken } = require("../middlewares/jwt");

router.route("/login").post(loginUser, generateToken);
router.route("/register").post(registerUser);
router.route("/logout").get(logoutUser);

module.exports = router;
