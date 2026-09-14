const express = require("express");

const {
    getAlerts
} = require("../controllers/alertController");

const validateCoordinates =
    require("../middleware/validateCoordinates");

const router = express.Router();

router.get(
    "/",
    validateCoordinates,
    getAlerts
);

module.exports = router;