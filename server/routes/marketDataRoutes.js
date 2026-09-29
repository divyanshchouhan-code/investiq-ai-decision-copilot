const express = require("express");

const router = express.Router();

const { getPrice } = require("../controllers/marketDataController");

router.get("/price/:symbol", getPrice);

module.exports = router;