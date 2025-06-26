"use client";

import { useState, useEffect } from "react";
import { auth } from "../firebase";

// Magyar kategóriák manuálisan megadva
const CATEGORY_OPTIONS = [
  "Szépirodalom",
  "Ismeretterjesztő",
  "Krimi",
  "Romantikus",
  "Sci-fi",
  "Fantasy",
  "Életrajz",
  "Önfejlesztés",
  "Történelem",
  "Gyermekkönyv",
  "Ifjúsági",
  "Thriller",
  "Üzleti",
  "Egészség és életmód",
  "Utazás",
];

export default function AdminPage() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({});
  const [editingBook, setEditingBook] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then(setBooks)
      .catch((err) => console.error("Könyvek betöltése hiba:", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingBook) {
      setEditingBook({ ...editingBook, [name]: value });
    } else {
      setNewBook({ ...newBook, [name]: value });
    }
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    if (editingBook) {
      setEditingBook({ ...editingBook, categories: selected });
    } else {
      setNewBook({ ...newBook, categories: selected });
    }
  };

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

      if (editingBook) {
        setEditingBook((prev) => ({ ...prev, cover_image_url: imageUrl }));
      } else {
        setNewBook((prev) => ({ ...prev, cover_image_url: imageUrl }));
      }
    } catch (err) {
      console.error(err);
      alert("Nem sikerült feltölteni a képet.");
    }
  };

  const handleAddBook = async () => {
    const requiredFields = ["title", "author", "price", "stock", "categories"];
    const missing = requiredFields.filter((f) => !newBook[f] || (Array.isArray(newBook[f]) && newBook[f].length === 0));
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

  const handleUpdateBook = async () => {
    try {
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`/api/books/${editingBook.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingBook),
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

  const handleDelete = async (id) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Törlés sikertelen");

      setBooks(books.filter((book) => book.id !== id));
    } catch (err) {
      console.error("Törlés hiba:", err);
      alert("Nem sikerült törölni a könyvet.");
    }
  };

  const filteredBooks = books.filter((book) =>
    (book.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (book.author || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 py-8 bg-white rounded shadow border">
      <h1 className="text-3xl font-bold text-green-900 mb-6">
        Admin felület – Könyvkezelés
      </h1>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          {editingBook ? "Könyv szerkesztése" : "Új könyv hozzáadása"}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {["title", "author", "publisher", "language", "publication_date"].map((field) => (
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
          ))}
          <textarea
            name="description"
            placeholder="Leírás"
            value={(editingBook || newBook).description || ""}
            onChange={handleInputChange}
            className="border p-2 rounded col-span-2"
          />
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

          <select
            name="categories"
            value={(editingBook || newBook).categories?.[0] || ""}
            onChange={(e) => {
              const selected = [e.target.value]; // egyetlen kategória tömbbe téve
              if (editingBook) {
                setEditingBook({ ...editingBook, categories: selected });
              } else {
                setNewBook({ ...newBook, categories: selected });
              }
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


          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-2 rounded"
          />

          {(editingBook?.cover_image_url || newBook?.cover_image_url) && (
            <img
  src={
    (editingBook?.cover_image_url || newBook?.cover_image_url)?.startsWith("http")
      ? (editingBook?.cover_image_url || newBook?.cover_image_url)
      : `http://localhost:3001${editingBook?.cover_image_url || newBook?.cover_image_url}`
  }
  alt="Borítókép"
  className="w-32 h-auto"
/>
          )}
        </div>

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

      <input
        type="text"
        placeholder="Keresés cím vagy szerző szerint..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded mb-6 w-full"
      />

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
              <p className="text-sm">Ár: {book.price} Ft | Készlet: {book.stock}</p>
              <p className="text-sm text-gray-500">
                Kiadó: {book.publisher}, Nyelv: {book.language}
              </p>
              <p className="text-sm text-gray-600">
                Kategóriák: {(book.categories || []).join(", ")}
              </p>
              {book.cover_image_url && (
                <img src={book.cover_image_url} alt="Borító" className="w-24 mt-2" />
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
