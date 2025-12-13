import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

import BookCard from "../components/BookCard";
import placeholderImage from "../assets/peldakonyv.png";

export default function RecommendedBooks() {
  const auth = getAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommended = async () => {
      setLoading(true);
      setError("");

      try {
        const user = auth.currentUser;
        const headers = {};

        if (user) {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(
          "http://localhost:3001/books/recommended",
          { headers }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.message ||
              `Hiba az ajánlott könyvek lekérésében (${res.status})`
          );
        }

        const data = await res.json();

        const formatted = data.map((book) => ({
          ...book,
          cover_image_url: book.cover_image_url?.startsWith("http")
            ? book.cover_image_url
            : `http://localhost:3001${book.cover_image_url || ""}`
        }));

        setBooks(formatted);
      } catch (err) {
        console.error("Hiba az ajánlott könyvek lekérésében:", err);
        setError("Nem sikerült betölteni az ajánlott könyveket.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, []);

  if (loading) {
    return (
      <section className="py-10 text-center text-gray-500 text-lg">
        Ajánlott könyvek betöltése...
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 text-center text-red-600">
        <p>{error}</p>
      </section>
    );
  }

  const limitedBooks = books.slice(0, 8);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-extrabold text-center text-green-900
                     border-b-2 border-yellow-400 w-fit mx-auto pb-2">
        Ajánlott könyvek
      </h2>

      {limitedBooks.length === 0 ? (
        <p className="text-gray-600 text-center mt-6">
          Nincsenek ajánlott könyvek jelenleg.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4
                        gap-6 mt-6">
          {limitedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={{
                ...book,
                cover_image_url:
                  book.cover_image_url || placeholderImage
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
