"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase";

const CATEGORY_OPTIONS = [
  "Szépirodalom", "Ismeretterjesztő", "Krimi", "Romantikus",
  "Sci-fi", "Fantasy", "Életrajz", "Önfejlesztés", "Történelem",
  "Gyermekkönyv", "Ifjúsági", "Thriller", "Üzleti",
  "Egészség és életmód", "Utazás",
];

export default function DiscountManager() {
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Összes");
  const [discountValue, setDiscountValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [page, setPage] = useState(1);

  const API_BASE = "http://localhost:3001";
  const ITEMS_PER_PAGE = 10;

  // ===== Könyvek lekérése =====
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/discounts/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Könyvlekérés hiba");
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error("❌ Hiba a könyvek lekérdezésekor:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Akciók lekérése =====
  const fetchDiscounts = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/discounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Akciólekérés hiba");
      const data = await res.json();
      setDiscounts(data);
    } catch (err) {
      console.error("❌ Hiba az akciók lekérdezésekor:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchDiscounts();
  }, []);

  // ===== Keresés + szűrés + lapozás =====
  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      selectedCategory === "Összes" ||
      (book.categories || []).includes(selectedCategory);
    const matchesSearch = (book.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const currentBooks = filteredBooks.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // ===== Kijelölés kezelése =====
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = filteredBooks.map((b) => b.id);
    if (allIds.every((id) => selected.includes(id))) {
      // Ha mind ki van jelölve → töröljük mindet
      setSelected(selected.filter((id) => !allIds.includes(id)));
    } else {
      // Kijelölünk minden, jelenleg szűrt könyvet (nem csak az aktuális oldalt)
      setSelected([...new Set([...selected, ...allIds])]);
    }
  };

  // ===== Akció alkalmazása =====
  const applyDiscount = async () => {
    if (!discountValue || selected.length === 0) {
      alert("Adj meg százalékot és válassz könyveket!");
      return;
    }
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0 || value > 100) {
      alert("A kedvezmény értéke 1 és 100 között legyen!");
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${value}% kedvezmény`,
          value,
          book_ids: selected,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      alert("✅ Akció sikeresen létrehozva!");
      setSelected([]);
      setDiscountValue("");
      fetchBooks();
      fetchDiscounts();
    } catch (err) {
      console.error("❌ Hiba az akció létrehozásakor:", err);
      alert("Hiba történt az akció létrehozásakor.");
    }
  };

  // ===== Akció törlése =====
  const deleteDiscount = async (id) => {
    if (!window.confirm("Biztosan törlöd ezt az akciót?")) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Törlés sikertelen");
      fetchDiscounts();
      fetchBooks();
    } catch (err) {
      console.error("❌ Hiba az akció törlésekor:", err);
      alert("Hiba történt az akció törlésekor.");
    }
  };

  // ===== Élő keresés =====
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(delay);
  }, [search, selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 py-8 bg-white rounded shadow border">
      <h1 className="text-3xl font-bold text-green-900 mb-6">
        Admin felület – Akciókezelő
      </h1>

      {/* Keresőmező */}
      <input
        type="text"
        placeholder="Keresés cím alapján..."
        className="border rounded px-3 py-2 w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Kategória szűrés */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setSelectedCategory("Összes")}
          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            selectedCategory === "Összes"
              ? "bg-green-600 text-white"
              : "bg-white text-green-700 border-green-300 hover:bg-green-100"
          }`}
        >
          Összes
        </button>
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              selectedCategory === cat
                ? "bg-green-600 text-white"
                : "bg-white text-green-700 border-green-300 hover:bg-green-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Akció beállítás */}
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="% kedvezmény"
          className="border px-3 py-2 w-32"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
        />
        <button
          onClick={applyDiscount}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={selected.length === 0}
        >
          Akció alkalmazása ({selected.length})
        </button>
      </div>

      {/* Könyvek táblázata */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-center">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    filteredBooks.length > 0 &&
                    filteredBooks.every((b) => selected.includes(b.id))
                  }
                />
              </th>
              <th className="p-2 border text-left">Cím</th>
              <th className="p-2 border text-left">Kategória</th>
              <th className="p-2 border text-center">Típus</th>
              <th className="p-2 border text-right">Ár</th>
              <th className="p-2 border">Akciók</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Betöltés...
                </td>
              </tr>
            ) : currentBooks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  Nincs találat
                </td>
              </tr>
            ) : (
              currentBooks.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(b.id)}
                      onChange={() => toggleSelect(b.id)}
                    />
                  </td>
                  <td className="p-2 border">{b.title}</td>
                  <td className="p-2 border text-sm text-gray-700">
                    {(b.categories || []).join(", ") || "-"}
                  </td>
                  <td className="p-2 border text-center">{b.type}</td>
                  <td className="p-2 border text-right">{b.price} Ft</td>
                  <td className="p-2 border text-sm">
                    {b.discounts.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {b.discounts.map((d) => (
                          <li key={d.id}>
                            {d.name} ({d.value}%)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">Nincs akció</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lapozás */}
      <div className="flex justify-center items-center gap-2 mt-4 text-green-800 font-semibold">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded border border-green-300 hover:bg-green-100 disabled:opacity-40"
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${
              page === i + 1
                ? "bg-green-600 text-white"
                : "bg-gray-100 hover:bg-green-100 text-green-800"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border border-green-300 hover:bg-green-100 disabled:opacity-40"
        >
          →
        </button>
      </div>

      {/* Akciók listája */}
      <h2 className="text-xl font-semibold mt-8 mb-2 text-green-900">
         Aktív akciók
      </h2>
      <div className="border rounded p-3 bg-gray-50">
        {discounts.length === 0 ? (
          <p className="text-gray-500">Nincs aktív akció.</p>
        ) : (
          <ul className="divide-y">
            {discounts.map((d) => (
              <li key={d.id} className="flex justify-between items-center py-2">
                <div>
                  <strong>{d.name}</strong> – {d.value}% ({d.attached_books} könyv)
                </div>
                <button
                  onClick={() => deleteDiscount(d.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Törlés
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
