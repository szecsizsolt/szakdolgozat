import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/blog/${id}`)
      .then((res) => res.json())
      .then(setPost)
      .catch((err) => console.error("Hiba:", err));
  }, [id]);

  if (!post) {
    return (
      <div className="max-w-screen-md mx-auto py-20 text-center text-red-700">
        A bejegyzés nem található.
      </div>
    );
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 py-12 text-olive-800">
      <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
      <p className="whitespace-pre-line leading-relaxed">{post.content}</p>
    </div>
  );
};

export default BlogPost;
