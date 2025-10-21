import express from "express";
import { registerUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import pool from "../db.js";

const router = express.Router();

// 🔹 Regisztráció (Firebase-ből érkező user hozzáadása az adatbázishoz)
router.post("/register", authenticate, registerUser);

// 🔹 Bejelentkezett felhasználó adatainak lekérése (pl. ID, email, név)
router.get("/me", authenticate, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    const { rows } = await pool.query(
      "SELECT id, name, email, role FROM users WHERE firebase_uid = $1",
      [firebaseUid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Felhasználó nem található." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Hiba az /auth/me lekérésnél:", err);
    res.status(500).json({ error: "Szerverhiba a felhasználó lekérésekor." });
  }
});

export default router;
