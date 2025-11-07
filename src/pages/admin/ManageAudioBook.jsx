"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const CATEGORY_OPTIONS = [
  "Szépirodalom", "Ismeretterjesztő", "Krimi", "Romantikus",
  "Sci-fi", "Fantasy", "Életrajz", "Önfejlesztés", "Történelem",
  "Gyermekkönyv", "Ifjúsági", "Thriller", "Üzleti",
  "Egészség és életmód", "Utazás"
];

export default function AudiobookAdminPage() {
  const [audiobooks, setAudiobooks] = useState([]);            // Hangoskönyvek listája
  const [newAudiobook, setNewAudiobook] = useState({ stock: 0 });
  const [editingAudiobook, setEditingAudiobook] = useState(null); // Jelenleg szerkesztett könyv
  const [search, setSearch] = useState("");                       // Keresés

  // Az aktív (új vagy szerkesztett) hangoskönyv
  const active = editingAudiobook || newAudiobook;

  // Kezdeti betöltés
  useEffect(() => {
    fetch("/api/audiobooks")
      .then((res) => res.json())
      .then(setAudiobooks)
      .catch((err) => console.error("Hangoskönyvek betöltési hiba:", err));
  }, []);

  // Input mezők kezelése
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    editingAudiobook
      ? setEditingAudiobook({ ...editingAudiobook, [name]: value })
      : setNewAudiobook({ ...newAudiobook, [name]: value });
  };

  // Kategória választás
  const handleCategoryChange = (e) => {
    const selected = [e.target.value];
    editingAudiobook
      ? setEditingAudiobook({ ...editingAudiobook, categories: selected })
      : setNewAudiobook({ ...newAudiobook, categories: selected });
  };

  // Borítókép feltöltés
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Feltöltési hiba");
      const data = await res.json();

      const update = { cover_image_url: data.url };
      editingAudiobook
        ? setEditingAudiobook({ ...editingAudiobook, ...update })
        : setNewAudiobook({ ...newAudiobook, ...update });
    } catch (err) {
      console.error(err);
      alert("Nem sikerült feltölteni a borítóképet.");
    }
  };

  // Hangfájl feltöltés
  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch("http://localhost:3001/api/upload/audio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Feltöltési hiba");

      const data = await res.json();

      const update = {
        audio_url: data.audio_url,
        duration_min: data.duration_min, // egységes kulcs
      };

      editingAudiobook
        ? setEditingAudiobook({ ...editingAudiobook, ...update })
        : setNewAudiobook({ ...newAudiobook, ...update });

      alert("Fájl feltöltve: " + file.name);
    } catch (err) {
      console.error(err);
      alert("Nem sikerült feltölteni a hangfájlt.");
    }
  };

  // Mentés (új vagy meglévő módosítása)
const handleSave = async () => {
  const token = await auth.currentUser.getIdToken();

  // Ha szerkesztünk → PATCH, egyébként POST
  const isEdit = Boolean(editingAudiobook);
  const method = isEdit ? "PATCH" : "POST";

  // Ha szerkesztünk, az audiobooks.id-t kell küldeni, nem a books.id-t!
  const targetId = editingAudiobook?.audiobook_id || editingAudiobook?.id;

  const endpoint = isEdit
  ? `${API_URL}/audiobooks/${targetId}`
  : `${API_URL}/audiobooks/full`;

  try {
    const res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(active),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    if (isEdit) {
      // Frissítés a listában
      setAudiobooks((prev) =>
        prev.map((b) =>
          b.id === data.id || b.audiobook_id === data.audiobook_id ? data : b
        )
      );
      setEditingAudiobook(null);
    } else {
      // Új elem hozzáadása
      setAudiobooks((prev) => [...prev, data]);
      setNewAudiobook({ stock: 0 });
    }

    alert("✅ Mentés sikeres!");
  } catch (err) {
    console.error("Mentés hiba:", err);
    alert("❌ Nem sikerült menteni a hangoskönyvet.");
  }
};

// Törlés
const handleDelete = async (id) => {
  const token = await auth.currentUser.getIdToken();

  // Ha a listában book.id van, a backendnek az audiobook_id kell
  const target = audiobooks.find((b) => b.id === id || b.audiobook_id === id);
  const targetId = target?.audiobook_id || id;

  try {
    const res = await fetch(`${API_URL}/audiobooks/${targetId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Törlés sikertelen");

    setAudiobooks((prev) =>
      prev.filter((b) => b.id !== id && b.audiobook_id !== id)
    );
    alert("🗑️ Hangoskönyv törölve!");
  } catch (err) {
    console.error("Törlés hiba:", err);
    alert("❌ Nem sikerült törölni a hangoskönyvet.");
  }
};


  // Keresési szűrés
  const filtered = audiobooks.filter(
    (e) =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 py-8 bg-white rounded shadow border">
      <h1 className="text-3xl font-bold text-green-900 mb-6">
        Admin – Hangoskönyv-kezelés
      </h1>

      {/* Új vagy szerkesztett űrlap */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          {editingAudiobook
            ? "Hangoskönyv szerkesztése"
            : "Új hangoskönyv hozzáadása"}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Szöveges mezők */}
          {[
            ["title", "Cím"],
            ["author", "Szerző"],
            ["publisher", "Kiadó"],
            ["language", "Nyelv"],
            ["publication_date", "Megjelenés (ÉÉÉÉ-HH-NN)"],
            ["price", "Ár (Ft)"],
            ["narrator", "Narrátor"],
          ].map(([field, label]) => (
            <input
              key={field}
              name={field}
              placeholder={label}
              value={active[field] || ""}
              onChange={handleInputChange}
              className="border p-2 rounded"
            />
          ))}
          {/* Leírás */}
          <textarea
            name="description"
            placeholder="Leírás"
            value={active.description || ""}
            onChange={handleInputChange}
            className="border p-2 rounded col-span-2"
          />
          {/* Kategória */}
          <select
            value={active.categories?.[0] || ""}
            onChange={handleCategoryChange}
            className="border p-2 rounded col-span-2"
          >
            <option value="">-- Válassz kategóriát --</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {/* Borítókép feltöltés */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-2 rounded"
          />
          {active.cover_image_url && (
            <img
              src={`http://localhost:3001${active.cover_image_url}`}
              alt="Borító"
              className="w-32 h-auto"
            />
          )}
          {/* Hangfájl feltöltés */}
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="border p-2 rounded col-span-2"
          />
        </div>
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {editingAudiobook ? "Mentés" : "Hangoskönyv hozzáadása"}
        </button>
        {editingAudiobook && (
          <button
            onClick={() => setEditingAudiobook(null)}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Mégse
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

      {/* Lista */}
      <h2 className="text-xl font-semibold mb-4">Hangoskönyvek listája</h2>
      {filtered.map((book) => (
        <div
          key={book.id}
          className="border p-4 rounded mb-4 flex justify-between items-start"
        >
          <div>
            <h3 className="text-lg font-bold">{book.title}</h3>
            <p className="text-sm text-gray-600">Szerző: {book.author}</p>
            <p className="text-sm">Ár: {book.price} Ft</p>
            <p className="text-sm text-gray-500">
              Narrátor: {book.narrator} | Hossz: {book.duration_min} perc
            </p>
            {book.cover_image_url && (
              <img
                src={`http://localhost:3001${book.cover_image_url}`}
                alt="Borító"
                className="w-24 mt-2"
              />
            )}
          </div>
          <div className="space-x-2">
            <button
              onClick={() =>
                setEditingAudiobook({
                  ...book,
                  id: book.audiobook_id || book.id, // mindig az audiobooks.id-t használjuk
                })
              }
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
  );
}
