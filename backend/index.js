import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticate, isAdmin } from './middleware/authMiddleware.js';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path, { join } from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import ebookRoutes from './routes/ebookRoutes.js';
import audiobookRoutes from './routes/audiobookRoutes.js';

// 🔽 __dirname kiszámítása ES Modules környezetben
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔽 Firebase service account betöltése biztonságosan
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'firebase-service-account.json'), 'utf8')
);

// 🔽 Környezeti változók betöltése
dotenv.config();

// 🔽 Firebase inicializálása
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🔽 Express alkalmazás létrehozása
const app = express();
app.use(cors());
app.use(express.json());

// 📁 Feltöltés beállítása
const storage = multer.diskStorage({
  destination: join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// 📤 Kép feltöltés
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nincs kép feltöltve" });
  res.json({ url: `/uploads/${req.file.filename}` });
});
app.use("/uploads", express.static(join(__dirname, 'uploads')));

// 🔀 API útvonalak
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/ebooks', ebookRoutes);
app.use('/audiobooks', audiobookRoutes);

// 🌍 Teszt route
app.get('/', (req, res) => {
  res.send('Online Könyvesbolt API működik ✅');
});

export default app;
