const express = require("express");
const { uploadRubric, getRubrics } = require("../controllers/rubricController");
const router = express.Router();

router.post("/upload", uploadRubric);
router.get("/", getRubrics);

module.exports = router;
