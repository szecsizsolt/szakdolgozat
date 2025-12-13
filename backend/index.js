import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path, { join } from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import ebookRoutes from "./routes/ebookRoutes.js";
import audiobookRoutes from "./routes/audiobookRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploads.js";
import blogRoutes from "./routes/blogRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";

// __dirname pótlása ES Modules környezetben
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Környezeti változók betöltése
dotenv.config();

// Firebase Admin inicializálása
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "firebase-service-account.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

// Fájlfeltöltés konfiguráció
const storage = multer.diskStorage({
  destination: join(__dirname, "uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Kép feltöltési végpont
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nincs kép feltöltve" });
  }

  res.json({ url: `/uploads/${req.file.filename}` });
});

// API route-ok regisztrálása
app.use("/auth", authRoutes);
app.use("/audiobooks", audiobookRoutes);
app.use("/ebooks", ebookRoutes);
app.use("/books", bookRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/user", userRoutes);
app.use("/api", uploadRoutes);
app.use("/blog", blogRoutes);
app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use("/reviews", reviewsRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/stripe", stripeRoutes);

// Teszt végpont
app.get("/", (_req, res) => {
  res.send("Online Könyvesbolt API működik");
});

// Szerver indítása
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT} porton`);
});
