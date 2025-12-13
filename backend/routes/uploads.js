import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Fájlnév normalizálása és tisztítása
function sanitizeFileName(filename) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.-]/g, "_");
}

// Feltöltési mappa létrehozása, ha nem létezik
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer tárhely konfiguráció egyedi fájlnevekkel
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safeName = sanitizeFileName(file.originalname);
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post("/upload/ebook", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nincs fájl feltöltve." });
  }

  const file = req.file;

  res.status(201).json({
    file_url: `/uploads/${file.filename}`,
    file_format: path.extname(file.originalname).slice(1).toLowerCase(),
    file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2))
  });
});

router.post("/upload/audio", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nincs fájl feltöltve." });
  }

  const file = req.file;

  res.status(201).json({
    audio_url: `/uploads/${file.filename}`,
    file_format: path.extname(file.originalname).slice(1).toLowerCase(),
    file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
    duration_min: 3.5
  });
});

export default router;
