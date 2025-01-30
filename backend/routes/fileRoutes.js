const express = require("express");
const upload = require("../config/multerConfig");
const { uploadEssays, getFiles, getFileByName } = require("../controllers/fileController");

const router = express.Router();

router.post("/upload", upload.array("pdfs", 32), uploadEssays);
router.get("/files", getFiles);
router.get("/files/:filename", getFileByName);

module.exports = router;
