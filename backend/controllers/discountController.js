import pool from "../db.js";


//  Könyvek listázása akciókezelőhöz.

export const listBooksForDiscountManager = async (req, res) => {
  try {
    const { search } = req.query;

    const params = [];
    let where = "1=1";

    if (search) {
      params.push(`%${search}%`);
      where = "(LOWER(title) LIKE LOWER($1) OR LOWER(author) LIKE LOWER($1))";
    }

    const { rows } = await pool.query(
      `
      SELECT 
        b.id,
        b.title,
        b.author,
        b.type,
        b.price,
        b.cover_image_url,
        b.stock,
        b.categories,
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'id', d.id,
              'name', d.name,
              'discount_type', d.discount_type,
              'value', d.value,
              'start_date', d.start_date,
              'end_date', d.end_date
            )
          ) FILTER (WHERE d.id IS NOT NULL),
          '[]'::json
        ) AS discounts
      FROM books b
      LEFT JOIN book_discounts bd ON bd.book_id = b.id
      LEFT JOIN discounts d ON d.id = bd.discount_id
      WHERE ${where}
      GROUP BY b.id
      ORDER BY b.title ASC
      `,
      params
    );

    res.json(rows);
  } catch (error) {
    console.error("listBooksForDiscountManager hiba:", error);
    res.status(500).json({
      error: "Szerverhiba a könyvek és akciók listázásakor."
    });
  }
};


 // Akciók listázása a hozzárendelt könyvek számával.
export const listDiscounts = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT 
        d.*,
        COUNT(bd.book_id)::int AS attached_books
      FROM discounts d
      LEFT JOIN book_discounts bd ON bd.discount_id = d.id
      GROUP BY d.id
      ORDER BY d.created_at DESC NULLS LAST
      `
    );

    res.json(rows);
  } catch (error) {
    console.error("listDiscounts hiba:", error);
    res.status(500).json({
      error: "Szerverhiba az akciók listázásakor."
    });
  }
};


 // Százalékos akció létrehozása és könyvekhez rendelése.
export const createPercentageDiscount = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      name,
      description = null,
      value,
      start_date = new Date(),
      end_date = null,
      book_ids = []
    } = req.body;

    const percent = Number(value);
    if (isNaN(percent) || percent <= 0 || percent > 100) {
      return res.status(400).json({
        error: "A kedvezmény értéke 0 és 100 közé essen."
      });
    }

    await client.query("BEGIN");

    const { rows } = await client.query(
      `
      INSERT INTO discounts
        (id, name, description, discount_type, value, start_date, end_date, created_at, updated_at)
      VALUES
        (uuid_generate_v4(), $1, $2, 'percentage', $3, $4, $5, NOW(), NOW())
      RETURNING *
      `,
      [name || `${percent}% kedvezmény`, description, percent, start_date, end_date]
    );

    const discount = rows[0];

    if (Array.isArray(book_ids) && book_ids.length > 0) {
      const values = book_ids
        .map((_, i) => `(uuid_generate_v4(), $1, $${i + 2})`)
        .join(", ");

      await client.query(
        `INSERT INTO book_discounts (id, discount_id, book_id) VALUES ${values}`,
        [discount.id, ...book_ids]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(discount);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("createPercentageDiscount hiba:", error);
    res.status(500).json({
      error: "Szerverhiba az akció létrehozásakor."
    });
  } finally {
    client.release();
  }
};


//  Akció adatainak frissítése.
export const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};

  const fields = [];
  const params = [];
  let idx = 1;

  ["name", "description", "value", "start_date", "end_date"].forEach((key) => {
    if (payload[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      params.push(payload[key]);
      idx++;
    }
  });

  if (fields.length === 0) {
    return res.status(400).json({
      error: "Nincs frissítendő mező."
    });
  }

  params.push(id);

  try {
    const { rows } = await pool.query(
      `
      UPDATE discounts
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING *
      `,
      params
    );

    if (!rows[0]) {
      return res.status(404).json({
        error: "Akció nem található."
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("updateDiscount hiba:", error);
    res.status(500).json({
      error: "Szerverhiba az akció frissítésekor."
    });
  }
};


 // Akció és hozzárendeléseinek törlése.
export const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "DELETE FROM book_discounts WHERE discount_id = $1",
      [id]
    );

    const { rows } = await client.query(
      "DELETE FROM discounts WHERE id = $1 RETURNING *",
      [id]
    );

    await client.query("COMMIT");

    if (!rows[0]) {
      return res.status(404).json({
        error: "Akció nem található."
      });
    }

    res.json({ ok: true, deleted: rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("deleteDiscount hiba:", error);
    res.status(500).json({
      error: "Szerverhiba az akció törlésekor."
    });
  } finally {
    client.release();
  }
};


//  Akció hozzárendelése könyvekhez.
export const assignDiscountToBooks = async (req, res) => {
  const { id } = req.params;
  const { book_ids = [] } = req.body;

  if (!Array.isArray(book_ids) || book_ids.length === 0) {
    return res.status(400).json({
      error: "Adj meg legalább egy könyv ID-t."
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: existing } = await client.query(
      `
      SELECT book_id
      FROM book_discounts
      WHERE discount_id = $1 AND book_id = ANY($2::uuid[])
      `,
      [id, book_ids]
    );

    const existingSet = new Set(existing.map(r => r.book_id));
    const toInsert = book_ids.filter(b => b && !existingSet.has(b));

    if (toInsert.length > 0) {
      const values = toInsert
        .map((_, i) => `(uuid_generate_v4(), $1, $${i + 2})`)
        .join(", ");

      await client.query(
        `INSERT INTO book_discounts (id, discount_id, book_id) VALUES ${values}`,
        [id, ...toInsert]
      );
    }

    await client.query("COMMIT");
    res.json({
      ok: true,
      added: toInsert.length,
      skipped: book_ids.length - toInsert.length
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("assignDiscountToBooks hiba:", error);
    res.status(500).json({
      error: "Szerverhiba a hozzárendelésnél."
    });
  } finally {
    client.release();
  }
};


 // Akció leválasztása könyvekről.
export const unassignDiscountFromBooks = async (req, res) => {
  const { id } = req.params;
  const { book_ids = [] } = req.body;

  if (!Array.isArray(book_ids) || book_ids.length === 0) {
    return res.status(400).json({
      error: "Adj meg legalább egy könyv ID-t."
    });
  }

  try {
    const result = await pool.query(
      `
      DELETE FROM book_discounts
      WHERE discount_id = $1 AND book_id = ANY($2::uuid[])
      `,
      [id, book_ids]
    );

    res.json({ ok: true, removed: result.rowCount });
  } catch (error) {
    console.error("unassignDiscountFromBooks hiba:", error);
    res.status(500).json({
      error: "Szerverhiba a leválasztásnál."
    });
  }
};


 // Egy könyvhöz tartozó legnagyobb kedvezmény lekérdezése.
export const getDiscountByBookPublic = async (req, res) => {
  const { bookId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT d.id, d.name, d.value
      FROM discounts d
      JOIN book_discounts bd ON bd.discount_id = d.id
      WHERE bd.book_id = $1
      ORDER BY d.value DESC
      LIMIT 1
      `,
      [bookId]
    );

    if (rows.length === 0) {
      return res.json({ value: null });
    }

    res.json({ value: rows[0].value });
  } catch (error) {
    console.error("getDiscountByBookPublic hiba:", error);
    res.status(500).json({
      message: "Szerverhiba az akció lekérdezésekor."
    });
  }
};
