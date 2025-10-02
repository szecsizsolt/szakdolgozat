import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Fájlnév tisztítás – ékezetek és speciális karakterek eltávolítása
function sanitizeFileName(filename) {
  return filename
    .normalize("NFD") // lebontja az ékezeteket
    .replace(/[\u0300-\u036f]/g, "") // törli az ékezeteket
    .replace(/[^\w.-]/g, "_"); // nem engedélyezett karakter helyett _
}

// Feltöltési mappa létrehozása, ha nem létezik
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer konfiguráció – fájlok egyedi névvel mentése
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = sanitizeFileName(file.originalname);
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// E-könyv feltöltés (PDF/TXT)
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

// Hangoskönyv feltöltés (MP3)
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
    duration_min: 3.5, // ideiglenes érték
  });
});

export default router;
