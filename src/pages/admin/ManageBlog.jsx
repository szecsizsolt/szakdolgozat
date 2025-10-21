import { useEffect, useState } from "react";
import { auth } from "../../firebase";

export default function ManageBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);

  // Bejegyzések betöltése
  useEffect(() => {
    fetch("http://localhost:3001/blog")
      .then((res) => res.json())
      .then(setPosts)
      .catch((err) => console.error("Hiba:", err));
  }, []);

  // Új blog feltöltése
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Be kell jelentkezned admin fiókkal!");
        return;
      }

      const token = await user.getIdToken(); // 🔑 Firebase token
      const res = await fetch("http://localhost:3001/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <- kötelező
        },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        const newPost = await res.json();
        setPosts([newPost, ...posts]);
        setTitle("");
        setContent("");
      } else {
        const err = await res.json();
        alert("Hiba: " + (err.error || res.status));
      }
    } catch (error) {
      console.error("Blog feltöltési hiba:", error);
    }
  };

  // Törlés
  const handleDelete = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Be kell jelentkezned!");
      const token = await user.getIdToken();

      if (!window.confirm("Biztosan törlöd?")) return;
      await fetch(`http://localhost:3001/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Törlési hiba:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Blog kezelés</h1>

      {/* Új bejegyzés */}
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Cím"
          className="block w-full border p-2 mb-3"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tartalom"
          className="block w-full border p-2 mb-3 h-40"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Feltöltés
        </button>
      </form>

      {/* Bloglista */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded shadow">
            <h2 className="text-lg font-bold">{post.title}</h2>
            <p className="text-sm text-gray-700">{post.content}</p>
            <button
              onClick={() => handleDelete(post.id)}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded"
            >
              Törlés
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
