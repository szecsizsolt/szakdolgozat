"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase";

// Kategória opciók
const CATEGORY_OPTIONS = [
  "Szépirodalom", "Ismeretterjesztő", "Krimi", "Romantikus",
  "Sci-fi", "Fantasy", "Életrajz", "Önfejlesztés", "Történelem",
  "Gyermekkönyv", "Ifjúsági", "Thriller", "Üzleti",
  "Egészség és életmód", "Utazás",
];

export default function AdminPage() {
  const [books, setBooks] = useState([]);              // Könyvek listája
  const [newBook, setNewBook] = useState({});          // Új könyv adatai
  const [editingBook, setEditingBook] = useState(null); // Aktuálisan szerkesztett könyv
  const [search, setSearch] = useState("");            // Keresőmező

  // Könyvek betöltése komponens induláskor
  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Hibás könyv lista formátum:", data);
          setBooks([]);
          return;
        }
        setBooks(data);
      })
      .catch((err) => console.error("Könyvek betöltése hiba:", err));
  }, []);

  // Input mezők változás kezelése
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    editingBook
      ? setEditingBook({ ...editingBook, [name]: value })
      : setNewBook({ ...newBook, [name]: value });
  };

  // Kategória választás
  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    editingBook
      ? setEditingBook({ ...editingBook, categories: selected })
      : setNewBook({ ...newBook, categories: selected });
  };

  // Kép feltöltés
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Feltöltési hiba");

      const data = await res.json();
      const imageUrl = data.url;

      editingBook
        ? setEditingBook((prev) => ({ ...prev, cover_image_url: imageUrl }))
        : setNewBook((prev) => ({ ...prev, cover_image_url: imageUrl }));
    } catch (err) {
      console.error(err);
      alert("Nem sikerült feltölteni a képet.");
    }
  };

  // Új könyv hozzáadása
  const handleAddBook = async () => {
    const required = ["title", "author", "price", "stock", "categories"];
    const missing = required.filter(
      (f) => !newBook[f] || (Array.isArray(newBook[f]) && newBook[f].length === 0)
    );
    if (missing.length > 0) {
      alert(`Hiányzó mezők: ${missing.join(", ")}`);
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBook),
      });

      if (!res.ok) throw new Error(await res.text());

      const createdBook = await res.json();
      setBooks([...books, createdBook]);
      setNewBook({});
      alert("Könyv sikeresen hozzáadva!");
    } catch (err) {
      console.error("Hozzáadás hiba:", err);
      alert("Hiba történt a könyv hozzáadása során.");
    }
  };

  // Könyv frissítése
    const handleUpdateBook = async () => {
    try {
      const token = await auth.currentUser.getIdToken();

      // csak a frissíthető mezőket küldjük
      const { id, ...dataToUpdate } = editingBook;

      const res = await fetch(`/api/books/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (!res.ok) throw new Error(await res.text());

      const updated = await res.json();
      setBooks(books.map((b) => (b.id === updated.id ? updated : b)));
      setEditingBook(null);
      alert("Sikeres frissítés");
    } catch (err) {
      console.error("Szerkesztés hiba:", err);
      alert("Nem sikerült frissíteni a könyvet.");
    }
  };


  // Könyv törlése
  const handleDelete = async (id) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Törlés sikertelen");
      setBooks(books.filter((book) => book.id !== id));
    } catch (err) {
      console.error("Törlés hiba:", err);
      alert("Nem sikerült törölni a könyvet.");
    }
  };

  // Keresés
  const filteredBooks = books.filter(
    (book) =>
      (book.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (book.author || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 py-8 bg-white rounded shadow border">
      <h1 className="text-3xl font-bold text-green-900 mb-6">
        Admin felület – Könyvkezelés
      </h1>

      {/* Új / Szerkesztés űrlap */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          {editingBook ? "Könyv szerkesztése" : "Új könyv hozzáadása"}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Alap mezők */}
          {["title", "author", "publisher", "language", "publication_date"].map(
            (field) => (
              <input
                key={field}
                name={field}
                placeholder={
                  {
                    title: "Könyv címe",
                    author: "Szerző neve",
                    publisher: "Kiadó neve",
                    language: "Nyelv",
                    publication_date: "Megjelenés dátuma (ÉÉÉÉ-HH-NN)",
                  }[field]
                }
                value={(editingBook || newBook)[field] || ""}
                onChange={handleInputChange}
                className="border p-2 rounded"
              />
            )
          )}
          {/* Leírás */}
          <textarea
            name="description"
            placeholder="Leírás"
            value={(editingBook || newBook).description || ""}
            onChange={handleInputChange}
            className="border p-2 rounded col-span-2"
          />
          {/* Ár és készlet */}
          <input
            name="price"
            type="number"
            placeholder="Ár (Ft)"
            value={(editingBook || newBook).price || ""}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <input
            name="stock"
            type="number"
            placeholder="Készlet"
            value={(editingBook || newBook).stock || ""}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />

          {/* Kategória */}
          <select
            name="categories"
            value={(editingBook || newBook).categories?.[0] || ""}
            onChange={(e) => {
              const selected = [e.target.value];
              editingBook
                ? setEditingBook({ ...editingBook, categories: selected })
                : setNewBook({ ...newBook, categories: selected });
            }}
            className="border p-2 rounded col-span-2"
          >
            <option value="">-- Válassz kategóriát --</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Borítókép */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-2 rounded"
          />
          {(editingBook?.cover_image_url || newBook?.cover_image_url) && (
            <img
              src={
                (editingBook?.cover_image_url || newBook?.cover_image_url)?.startsWith(
                  "http"
                )
                  ? editingBook?.cover_image_url || newBook?.cover_image_url
                  : `http://localhost:3001${
                      editingBook?.cover_image_url || newBook?.cover_image_url
                    }`
              }
              alt="Borítókép"
              className="w-32 h-auto"
            />
          )}
        </div>

        {/* Gombok */}
        {editingBook ? (
          <>
            <button
              onClick={handleUpdateBook}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
            >
              Mentés
            </button>
            <button
              onClick={() => setEditingBook(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Mégse
            </button>
          </>
        ) : (
          <button
            onClick={handleAddBook}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Könyv hozzáadása
          </button>
        )}
      </div>

      {/* Keresés */}
      <input
        type="text"
        placeholder="Keresés cím vagy szerző szerint..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded mb-6 w-full"
      />

      {/* Könyvek listája */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Könyvek listája</h2>
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="border p-4 rounded mb-4 flex justify-between items-start"
          >
            <div>
              <h3 className="text-lg font-bold">{book.title}</h3>
              <p className="text-sm text-gray-600">Szerző: {book.author}</p>
              <p className="text-sm">
                Ár: {book.price} Ft | Készlet: {book.stock}
              </p>
              <p className="text-sm text-gray-500">
                Kiadó: {book.publisher}, Nyelv: {book.language}
              </p>
              <p className="text-sm text-gray-600">
                Kategóriák: {(book.categories || []).join(", ")}
              </p>
              {book.cover_image_url && (
                <img
                  src={
                    book.cover_image_url.startsWith("http")
                      ? book.cover_image_url
                      : `http://localhost:3001${book.cover_image_url}`
                  }
                  alt="Borító"
                  className="w-24 mt-2"
                />
              )}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setEditingBook(book)}
                className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100"
              >
                Módosítás
              </button>
              <button
                onClick={() => handleDelete(book.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Törlés
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
