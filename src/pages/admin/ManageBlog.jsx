import { useEffect, useState } from "react";
import { auth } from "../../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function ManageBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);

  // Blogbejegyzések betöltése
  useEffect(() => {
    fetch(`${API_URL}/blog`)
      .then((res) => res.json())
      .then(setPosts)
      .catch((err) => console.error("Blog betöltési hiba:", err));
  }, []);

  // Új bejegyzés létrehozása
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Be kell jelentkezned admin fiókkal!");
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/blog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Hiba: " + (err.error || res.status));
        return;
      }

      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Blog feltöltési hiba:", err);
    }
  };

  // Bejegyzés törlése
  const handleDelete = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Be kell jelentkezned!");
        return;
      }

      if (!window.confirm("Biztosan törlöd ezt a bejegyzést?")) return;

      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Törlési hiba:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Blog kezelés</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          placeholder="Cím"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full border p-2 mb-3"
          required
        />

        <textarea
          placeholder="Tartalom"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="block w-full border p-2 mb-3 h-40"
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Feltöltés
        </button>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-bold">{post.title}</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {post.content}
            </p>
            <button
              onClick={() => handleDelete(post.id)}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Törlés
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
