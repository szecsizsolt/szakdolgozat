import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaShoppingCart, FaStar, FaTrash } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { addToCartBackend } from "../utils/cart";
import { useNavigate } from "react-router-dom";

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    { rating: 5, text: "Nagyon jó könyv.", date: new Date() },
    { rating: 1, text: "Nekem nem tetszett.", date: new Date() },
  ]);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  const handleRead = () => {
    if (book.type === "ebook") {
      navigate(`/ebook/${book.id}`);
    } else if (book.type === "audiobook") {
      navigate(`/audiobook/${book.id}`);
    }
  };

  const auth = getAuth();

  useEffect(() => {
    fetch(`http://localhost:3001/books/${id}`)
      .then((res) => res.json())
      .then(setBook)
      .catch((err) => {
        console.error("Könyv betöltési hiba:", err);
        alert("Nem sikerült betölteni a könyv adatokat.");
      });
  }, [id]);

  // Vásárlás ellenőrzése
  useEffect(() => {
    const checkPurchase = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const res = await fetch("http://localhost:3001/user/purchases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const hasPurchased = data.some(
          (item) => item.book_id === id && (item.item_type === "ebook" || item.item_type === "audiobook")
        );

        setHasAccess(hasPurchased);
      } catch (err) {
        console.error("Vásárlás ellenőrzési hiba:", err);
      }
    };

    checkPurchase();
  }, [id, auth]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim() !== "") {
      setComments([...comments, { rating, text: comment, date: new Date() }]);
      setComment("");
      setRating(5);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCartBackend(book.id, 1, book.type);
      alert("Kosárba helyezve!");
    } catch (err) {
      console.error("Kosárba helyezési hiba:", err);
      alert("Hiba: " + err.message);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  if (!book) {
    return <p className="text-center mt-10 text-gray-500">Könyv betöltése...</p>;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10 space-y-10">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <img
          src={book.cover_image_url || "/placeholder.png"}
          alt={book.title}
          className="w-72 h-auto shadow-lg rounded"
        />

        <div className="flex-1 space-y-4 relative w-full">
          <div className="absolute right-0 top-0 flex flex-col items-end gap-2">
            <p className="text-2xl font-bold text-gray-800">{book.price} Ft</p>

            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold px-5 py-2 rounded shadow"
            >
              <FaShoppingCart />
              Kosárba
            </button>

            {/* OLVASÁS gomb feltételesen */}
            {(book.type === "ebook" || book.type === "audiobook") && (
              <button
                onClick={handleRead}
                disabled={!hasAccess}
                className={`flex items-center gap-2 px-5 py-2 rounded shadow font-bold ${
                  hasAccess
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                📖 Olvasás
              </button>
            )}
          </div>

          <h1 className="text-3xl font-bold text-green-900 pr-40">{book.title}</h1>
          <p className="text-lg text-gray-700">
            Szerző: <span className="font-semibold">{book.author || "Ismeretlen"}</span>
          </p>
          <p className="text-gray-600">
            Kiadó: <span className="font-medium">{book.publisher || "Ismeretlen"}</span>
          </p>
          <p className="text-gray-600">
            Típus: <span className="font-medium">{book.type || "Ismeretlen"}</span>
          </p>
          <div className="flex items-center gap-1 text-yellow-500 text-xl">
            {[...Array(book.rating || 4)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>

          <p className="text-sm leading-relaxed text-gray-800">
            {book.description || "Nincs leírás."}
          </p>
        </div>
      </div>

      {/* Vélemény írás */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-900">Értékelés</h2>

        <div className="flex items-center gap-1 text-yellow-500 text-2xl">
          {[...Array(5)].map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className={i < rating ? "text-yellow-500" : "text-gray-300"}
            >
              <FaStar />
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Írjon véleményt..."
            className="w-full border rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-yellow-400"
            rows="4"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
          >
            Küldés
          </button>
        </form>
      </section>

      {/* Vélemények listázása */}
      {comments.length > 0 && (
        <section className="space-y-6 mt-10">
          <h3 className="text-xl font-bold text-green-900">Olvasói vélemények</h3>
          <div className="flex flex-col gap-6">
            {comments.map((c, index) => (
              <div
                key={index}
                className="bg-[#fefae0] p-4 rounded-lg shadow-md border border-yellow-300 relative"
              >
                <button
                  onClick={() => handleDelete(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Törlés"
                >
                  <FaTrash />
                </button>

                <div className="flex items-center gap-1 mb-2 text-yellow-500">
                  {[...Array(c.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <p className="text-xs text-gray-400 mb-1">{formatDate(c.date)}</p>
                <p className="text-gray-700">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
