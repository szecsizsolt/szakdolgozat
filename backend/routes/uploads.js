import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Fájlnév normalizáló – ékezetek eltávolítása, biztonságos név
function sanitizeFileName(filename) {
  return filename
    .normalize("NFD") // Ékezetes karakterek lebontása
    .replace(/[\u0300-\u036f]/g, "") // ékezetek eltávolítása
    .replace(/[^\w.-]/g, "_"); // minden nem engedélyezett karakter _ lesz
}

// Biztosítsd, hogy az uploads/ mappa létezik
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer konfiguráció – fájlok mentése egyedi, tisztított névvel
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = sanitizeFileName(file.originalname);
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/**
 * E-book fájl feltöltés
 * Vár: "file" kulcs alatt PDF vagy TXT
 */
router.post("/upload/ebook", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nincs fájl feltöltve." });
  }

  const file = req.file;
  const fileUrl = `/uploads/${file.filename}`;
  const fileFormat = path.extname(file.originalname).slice(1).toLowerCase();
  const fileSizeMb = (file.size / 1024 / 1024).toFixed(2);

  res.status(201).json({
    file_url: fileUrl,
    file_format: fileFormat,
    file_size_mb: parseFloat(fileSizeMb),
  });
});

/**
 * Hangoskönyv fájl feltöltés
 * Vár: "audio" kulcs alatt MP3 fájl
 */
router.post("/upload/audio", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nincs fájl feltöltve." });
  }

  const file = req.file;
  const audioUrl = `/uploads/${file.filename}`;
  const fileFormat = path.extname(file.originalname).slice(1).toLowerCase();
  const fileSizeMb = (file.size / 1024 / 1024).toFixed(2);

  res.status(201).json({
    audio_url: audioUrl,
    file_format: fileFormat,
    file_size_mb: parseFloat(fileSizeMb),
    duration_min: 3.5, // ideiglenes érték (később lehet analizálni)
  });
});

export default router;
