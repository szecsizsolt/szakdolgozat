"use client";

import { useEffect, useState } from "react";
import { auth } from "../../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const CATEGORY_OPTIONS = [
  "Szépirodalom", "Ismeretterjesztő", "Krimi", "Romantikus",
  "Sci-fi", "Fantasy", "Életrajz", "Önfejlesztés", "Történelem",
  "Gyermekkönyv", "Ifjúsági", "Thriller", "Üzleti",
  "Egészség és életmód", "Utazás",
];

export default function AudiobookAdminPage() {
  const [audiobooks, setAudiobooks] = useState([]);
  const [newAudiobook, setNewAudiobook] = useState({ stock: 0 });
  const [editingAudiobook, setEditingAudiobook] = useState(null);
  const [search, setSearch] = useState("");

  const active = editingAudiobook || newAudiobook;

  useEffect(() => {
    fetch(`${API_URL}/audiobooks`)
      .then((res) => res.json())
      .then(setAudiobooks)
      .catch((err) =>
        console.error("Hangoskönyvek betöltési hiba:", err)
      );
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    editingAudiobook
      ? setEditingAudiobook({ ...editingAudiobook, [name]: value })
      : setNewAudiobook({ ...newAudiobook, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const categories = [e.target.value];
    editingAudiobook
      ? setEditingAudiobook({ ...editingAudiobook, categories })
      : setNewAudiobook({ ...newAudiobook, categories });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();

      const { url } = await res.json();
      const update = { cover_image_url: url };

      editingAudiobook
        ? setEditingAudiobook({ ...editingAudiobook, ...update })
        : setNewAudiobook({ ...newAudiobook, ...update });
    } catch {
      alert("Nem sikerült feltölteni a borítóképet.");
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch(`${API_URL}/api/upload/audio`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();

      const data = await res.json();
      const update = {
        audio_url: data.audio_url,
        duration_min: data.duration_min,
      };

      editingAudiobook
        ? setEditingAudiobook({ ...editingAudiobook, ...update })
        : setNewAudiobook({ ...newAudiobook, ...update });
    } catch {
      alert("Nem sikerült feltölteni a hangfájlt.");
    }
  };

  const handleSave = async () => {
    const token = await auth.currentUser.getIdToken();
    const isEdit = Boolean(editingAudiobook);
    const targetId = editingAudiobook?.audiobook_id || editingAudiobook?.id;

    const endpoint = isEdit
      ? `${API_URL}/audiobooks/${targetId}`
      : `${API_URL}/audiobooks/full`;

    try {
      const res = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(active),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setAudiobooks((prev) =>
        isEdit
          ? prev.map((b) =>
              b.id === data.id || b.audiobook_id === data.audiobook_id
                ? data
                : b
            )
          : [...prev, data]
      );

      setEditingAudiobook(null);
      setNewAudiobook({ stock: 0 });
      alert("Mentés sikeres!");
    } catch {
      alert("Nem sikerült menteni a hangoskönyvet.");
    }
  };

  const handleDelete = async (id) => {
    const token = await auth.currentUser.getIdToken();
    const target = audiobooks.find((b) => b.id === id || b.audiobook_id === id);
    const targetId = target?.audiobook_id || id;

    try {
      const res = await fetch(`${API_URL}/audiobooks/${targetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      setAudiobooks((prev) =>
        prev.filter((b) => b.id !== id && b.audiobook_id !== id)
      );
    } catch {
      alert("Nem sikerült törölni a hangoskönyvet.");
    }
  };

  const filtered = audiobooks.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 py-8 bg-white rounded shadow border">
      <h1 className="text-3xl font-bold text-green-900 mb-6">
        Admin – Hangoskönyv-kezelés
      </h1>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          {editingAudiobook
            ? "Hangoskönyv szerkesztése"
            : "Új hangoskönyv hozzáadása"}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
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

          <textarea
            name="description"
            placeholder="Leírás"
            value={active.description || ""}
            onChange={handleInputChange}
            className="border p-2 rounded col-span-2"
          />

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

          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <input type="file" accept="audio/*" onChange={handleAudioUpload} />
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

      <input
        type="text"
        placeholder="Keresés cím vagy szerző szerint..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded mb-6 w-full"
      />

      <h2 className="text-xl font-semibold mb-4">Hangoskönyvek listája</h2>

      {filtered.map((book) => (
        <div
          key={book.id}
          className="border p-4 rounded mb-4 flex justify-between"
        >
          <div>
            <h3 className="font-bold">{book.title}</h3>
            <p className="text-sm text-gray-600">Szerző: {book.author}</p>
            <p className="text-sm">Ár: {book.price} Ft</p>
            <p className="text-sm text-gray-500">
              Narrátor: {book.narrator} | {book.duration_min} perc
            </p>
          </div>

          <div className="space-x-2">
            <button
              onClick={() =>
                setEditingAudiobook({
                  ...book,
                  id: book.audiobook_id || book.id,
                })
              }
              className="border px-3 py-1 rounded"
            >
              Módosítás
            </button>
            <button
              onClick={() => handleDelete(book.id)}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Törlés
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
