const express = require("express");
const upload = require("../config/multerConfig");
const { uploadEssays, getEssayById, getEssays, getEssaysWithContent } = require("../controllers/fileController");

const router = express.Router();

router.post("/upload", upload.array("essayFile", 32), uploadEssays);
router.get("/", getEssays);
router.get("/:id", getEssayById);

module.exports = router;
