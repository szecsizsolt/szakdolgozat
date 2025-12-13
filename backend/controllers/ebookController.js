import pool from "../db.js";
import fs from "fs/promises";
import path from "path";


//  Közös lekérdezés az e-könyvekhez kapcsolódó adatokhoz.
const baseSelect = `
  SELECT 
    books.id AS id,
    books.title,
    books.author,
    books.price,
    books.cover_image_url, 
    books.publisher,
    books.language,
    books.publication_date, 
    books.description,
    books.categories,
    books.type,
    ebooks.id AS ebook_id,
    ebooks.file_url,
    ebooks.file_format,
    ebooks.file_size_mb
  FROM books
  LEFT JOIN ebooks ON ebooks.book_id = books.id
`;


//  Számérték biztonságos konvertálása.
const toSafeNumber = (value) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};


export const getEbooks = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `${baseSelect} WHERE books.type = 'ebook'`
    );
    res.json(rows);
  } catch (error) {
    console.error("getEbooks hiba:", error);
    res.status(500).json({
      error: "Szerver hiba az e-könyvek lekérdezésekor."
    });
  }
};


export const getEbookById = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `${baseSelect} WHERE books.id = $1::uuid`,
      [id.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "E-könyv nem található."
      });
    }

    const ebook = rows[0];

    if (ebook.file_url && ebook.file_url.endsWith(".txt")) {
      try {
        const filePath = path.resolve(
          "uploads",
          path.basename(ebook.file_url)
        );

        const text = await fs.readFile(filePath, "utf8");

        const cleanText = text
          .replace(/\r\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .replace(/[ \t]+/g, " ")
          .trim();

        const paragraphs = cleanText.split(/\n\s*\n/);

        const pages = [];
        let buffer = "";

        for (const para of paragraphs) {
          if ((buffer + "\n\n" + para).length > 3500) {
            pages.push(buffer.trim());
            buffer = para;
          } else {
            buffer += "\n\n" + para;
          }
        }

        if (buffer.trim()) {
          pages.push(buffer.trim());
        }

        ebook.content = pages;
        ebook.totalPages = pages.length;
      } catch (error) {
        console.error("Fájl olvasási hiba:", error);
        ebook.content = [
          "A fájl nem olvasható vagy nem található."
        ];
        ebook.totalPages = 1;
      }
    } else {
      ebook.content = [
        "Ez a formátum nem jeleníthető meg szövegként."
      ];
      ebook.totalPages = 1;
    }

    res.json(ebook);
  } catch (error) {
    console.error("getEbookById hiba:", error);
    res.status(500).json({
      error: "Szerver hiba e-könyv lekérdezésekor."
    });
  }
};


export const createEbook = async (req, res) => {
  const {
    title,
    author,
    description,
    publisher,
    language,
    publication_date,
    price,
    cover_image_url,
    categories,
    file_url,
    file_format,
    file_size_mb
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: bookRows } = await client.query(
      `
      INSERT INTO books (
        id, title, author, description, publisher,
        language, publication_date, price, stock,
        cover_image_url, categories, type
      )
      VALUES (
        uuid_generate_v4(), $1, $2, $3, $4,
        $5, $6, $7, 0, $8, $9, 'ebook'
      )
      RETURNING id
      `,
      [
        title,
        author,
        description,
        publisher,
        language,
        publication_date,
        price,
        cover_image_url,
        categories
      ]
    );

    const bookId = bookRows[0].id;

    await client.query(
      `
      INSERT INTO ebooks (id, book_id, file_url, file_format, file_size_mb)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4)
      `,
      [
        bookId,
        file_url,
        file_format,
        toSafeNumber(file_size_mb)
      ]
    );

    const { rows } = await client.query(
      `${baseSelect} WHERE books.id = $1`,
      [bookId]
    );

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("createEbook hiba:", error);
    res.status(500).json({
      error: "Szerver hiba e-könyv létrehozásakor."
    });
  } finally {
    client.release();
  }
};


export const updateEbook = async (req, res) => {
  const ebookId = req.params.id;
  const {
    title,
    author,
    description,
    publisher,
    language,
    publication_date,
    price,
    cover_image_url,
    categories,
    file_url,
    file_format,
    file_size_mb
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT book_id FROM ebooks WHERE id = $1",
      [ebookId]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "E-könyv nem található"
      });
    }

    const bookId = rows[0].book_id;

    await client.query(
      `
      UPDATE books
      SET
        title = $1,
        author = $2,
        description = $3,
        publisher = $4,
        language = $5,
        publication_date = $6,
        price = $7,
        cover_image_url = $8,
        categories = $9
      WHERE id = $10
      `,
      [
        title,
        author,
        description,
        publisher,
        language,
        publication_date,
        price,
        cover_image_url,
        categories,
        bookId
      ]
    );

    await client.query(
      `
      UPDATE ebooks
      SET
        file_url = $1,
        file_format = $2,
        file_size_mb = $3
      WHERE id = $4
      `,
      [
        file_url,
        file_format,
        toSafeNumber(file_size_mb),
        ebookId
      ]
    );

    const { rows: resultRows } = await client.query(
      `${baseSelect} WHERE books.id = $1`,
      [bookId]
    );

    await client.query("COMMIT");
    res.json(resultRows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("updateEbook hiba:", error);
    res.status(500).json({
      error: "Hiba az e-könyv frissítésekor."
    });
  } finally {
    client.release();
  }
};


export const deleteEbook = async (req, res) => {
  const ebookId = req.params.id;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT book_id FROM ebooks WHERE id = $1",
      [ebookId]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "E-könyv nem található"
      });
    }

    const bookId = rows[0].book_id;

    await client.query(
      "DELETE FROM ebooks WHERE id = $1",
      [ebookId]
    );

    await client.query(
      "DELETE FROM books WHERE id = $1",
      [bookId]
    );

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("deleteEbook hiba:", error);
    res.status(500).json({
      error: "Szerver hiba e-könyv törlésekor."
    });
  } finally {
    client.release();
  }
};
