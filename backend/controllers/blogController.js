import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

// GET összes
export const getAllPosts = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM blog_posts ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Blog lekérdezési hiba:", err);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

// GET egy poszt ID alapján
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM blog_posts WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Bejegyzés nem található" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Blog poszt lekérdezési hiba:", err);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

// POST (admin)
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO blog_posts (id, title, content) VALUES ($1, $2, $3) RETURNING *",
      [uuidv4(), title, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Blog létrehozási hiba:", err);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

// DELETE (admin)
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM blog_posts WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Bejegyzés nem található" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Törlési hiba:", err);
    res.status(500).json({ error: "Szerver hiba" });
  }
};
