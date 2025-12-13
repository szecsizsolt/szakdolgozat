import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Blogbejegyzések listázása
const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/blog")
      .then((res) => res.json())
      .then(setPosts)
      .catch((err) => console.error("Blog betöltési hiba:", err));
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center text-olive-800 mb-10">
        Olvasási tippek és blog
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-yellow-200 rounded-xl p-6 shadow text-olive-800"
          >
            <h3 className="text-lg font-bold mb-2">{post.title}</h3>
            <p className="text-sm line-clamp-3">
              {post.content.slice(0, 120)}...
            </p>
            <Link
              to={`/blog/${post.id}`}
              className="mt-4 inline-block text-yellow-600 font-semibold hover:underline"
            >
              Tovább olvasom →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
