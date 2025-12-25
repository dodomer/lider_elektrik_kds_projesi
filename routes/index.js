const express = require("express");
const router = express.Router();

router.use("/", require("./api")); // /api altındaki endpointler

module.exports = router;
