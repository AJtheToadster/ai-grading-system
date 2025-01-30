const express = require("express");
const upload = require("../config/multerConfig");
const { uploadRubric, getRubrics } = require("../controllers/rubricController");

const router = express.Router();

router.post("/upload", upload.single("rubricFile"), uploadRubric);
router.get("/", getRubrics);

module.exports = router;
