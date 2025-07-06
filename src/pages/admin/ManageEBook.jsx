"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase";

const CATEGORY_OPTIONS = [
  "Szépirodalom", "Ismeretterjesztő", "Krimi", "Romantikus",
  "Sci-fi", "Fantasy", "Életrajz", "Önfejlesztés", "Történelem",
  "Gyermekkönyv", "Ifjúsági", "Thriller", "Üzleti",
  "Egészség és életmód", "Utazás"
];

export default function EbookAdminPage() {
  const [ebooks, setEbooks] = useState([]);
  const [newEbook, setNewEbook] = useState({ stock: 0 });
  const [editingEbook, setEditingEbook] = useState(null);
  const [search, setSearch] = useState("");

  const active = editingEbook || newEbook;

  useEffect(() => {
    fetch("/api/ebooks")
      .then((res) => res.json())
      .then(setEbooks)
      .catch((err) => console.error("E-könyvek betöltése hiba:", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    editingEbook
      ? setEditingEbook({ ...editingEbook, [name]: value })
      : setNewEbook({ ...newEbook, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const selected = [e.target.value];
    editingEbook
      ? setEditingEbook({ ...editingEbook, categories: selected })
      : setNewEbook({ ...newEbook, categories: selected });
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
      const update = { cover_image_url: data.url };
      editingEbook
        ? setEditingEbook({ ...editingEbook, ...update })
        : setNewEbook({ ...newEbook, ...update });
    } catch (err) {
      console.error(err);
      alert("Nem sikerült feltölteni a borítóképet.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/api/upload/ebook", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Feltöltési hiba");

      const data = await res.json();

      const update = {
        file_url: data.file_url,
        file_format: data.file_format,
        file_size_mb: data.file_size_mb,
      };

      editingEbook
        ? setEditingEbook({ ...editingEbook, ...update })
        : setNewEbook({ ...newEbook, ...update });

      alert("Fájl feltöltve: " + file.name);
    } catch (err) {
      console.error(err);
      alert("Nem sikerült feltölteni az e-könyv fájlt.");
    }
  };

  const handleSave = async () => {
    const token = await auth.currentUser.getIdToken();
    const method = editingEbook ? "PATCH" : "POST";
    const endpoint = editingEbook ? `/api/ebooks/${editingEbook.id}` : "/api/ebooks/full";

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
      if (editingEbook) {
        setEbooks(ebooks.map((b) => (b.id === data.id ? data : b)));
        setEditingEbook(null);
      } else {
        setEbooks([...ebooks, data]);
        setNewEbook({ stock: 0 });
      }
      alert("Mentés sikeres");
    } catch (err) {
      console.error("Mentés hiba:", err);
      alert("Nem sikerült menteni az e-könyvet.");
    }
  };

  const handleDelete = async (id) => {
    const token = await auth.currentUser.getIdToken();
    try {
      const res = await fetch(`/api/ebooks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Törlés sikertelen");
      setEbooks(ebooks.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Törlés hiba:", err);
    }
  };

  const filtered = ebooks.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 px-6 py-8 bg-white rounded shadow border">
      <h1 className="text-3xl font-bold text-green-900 mb-6">Admin – E-könyvkezelés</h1>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">{editingEbook ? "E-könyv szerkesztése" : "Új e-könyv hozzáadása"}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[["title", "Cím"], ["author", "Szerző"], ["publisher", "Kiadó"], ["language", "Nyelv"], ["publication_date", "Megjelenés (ÉÉÉÉ-HH-NN)"], ["price", "Ár (Ft)"]].map(([field, label]) => (
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
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input type="file" accept="image/*" onChange={handleImageUpload} className="border p-2 rounded" />
          {active.cover_image_url && (
            <img src={`http://localhost:3001${active.cover_image_url}`} alt="Borító" className="w-32 h-auto" />
          )}

          <div className="col-span-2">
            <label className="block mb-1 text-sm font-medium">E-könyv fájl (.pdf vagy .txt)</label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              className="border p-2 rounded w-full"
            />
            {active.file_url && (
              <p className="text-sm mt-1 text-gray-600 font-mono">
                Feltöltve: {active.file_url}
              </p>
            )}
          </div>
        </div>

        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          {editingEbook ? "Mentés" : "E-könyv hozzáadása"}
        </button>
        {editingEbook && (
          <button
            onClick={() => setEditingEbook(null)}
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

      <h2 className="text-xl font-semibold mb-4">E-könyvek listája</h2>
      {filtered.map((book) => (
        <div key={book.id} className="border p-4 rounded mb-4 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{book.title}</h3>
            <p className="text-sm text-gray-600">Szerző: {book.author}</p>
            <p className="text-sm">{book.price} Ft</p>
            <p className="text-sm text-gray-500">
              Formátum: {book.file_format} | Méret: {book.file_size_mb} MB
            </p>
            {book.cover_image_url && (
              <img src={`http://localhost:3001${book.cover_image_url}`} alt="Borító" className="w-24 mt-2" />
            )}
          </div>
          <div className="space-x-2">
            <button onClick={() => setEditingEbook(book)} className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100">
              Módosítás
            </button>
            <button onClick={() => handleDelete(book.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
              Törlés
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
