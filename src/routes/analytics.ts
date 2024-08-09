const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/jwt");

const {
  getOverallAnalytics,
  getEventAnalytics,
} = require("../controllers/analytics");

router.route("/overall").get(verifyToken, getOverallAnalytics);
router.route("/event/:id").get(verifyToken, getEventAnalytics);

module.exports = router;
