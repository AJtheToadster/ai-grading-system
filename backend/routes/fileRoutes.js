const express = require("express");
const upload = require("../config/multerConfig");
const { uploadEssays, getFiles, getFileByName, getEssayById, getEssays } = require("../controllers/fileController");

const router = express.Router();

router.post("/upload", upload.array("pdfs", 32), uploadEssays);
router.get("/", getEssays);
router.get("/:id", getEssayById);

module.exports = router;
