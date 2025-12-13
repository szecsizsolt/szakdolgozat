import pool from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const getAllPosts = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM blog_posts ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("getAllPosts hiba:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM blog_posts WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Bejegyzés nem található"
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("getPostById hiba:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

export const createPost = async (req, res) => {
  const { title, content } = req.body;

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO blog_posts (id, title, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [uuidv4(), title, content]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("createPost hiba:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM blog_posts WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Bejegyzés nem található"
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("deletePost hiba:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
};
