const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/jwt");

const { generateTicket } = require("../controllers/tickets");

router.route("/:id/generateTicket").post(verifyToken, generateTicket);

module.exports = router;
