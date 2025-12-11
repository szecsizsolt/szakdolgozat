import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaStar, FaTrash } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { addToCartBackend } from "../utils/cart";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:3001";

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();
  const { incrementCart } = useCart();

  // ⭐ Könyv betöltése
  useEffect(() => {
    fetch(`${API_URL}/books/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cover_image_url && !data.cover_image_url.startsWith("http")) {
          data.cover_image_url = `${API_URL}${data.cover_image_url}`;
        }
        setBook(data);
      })
      .catch(() => alert("Nem sikerült betölteni a könyv adatokat."));
  }, [id]);

  // ⭐ Akció lekérése
  useEffect(() => {
    if (!book) return;

    fetch(`${API_URL}/api/discounts/book/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No discount");
        return res.json();
      })
      .then((data) => setDiscount(data))
      .catch(() => setDiscount(null)); // ha nincs akció
  }, [book, id]);

  // ⭐ Vélemények lekérése
  useEffect(() => {
    fetch(`${API_URL}/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [id]);

  // ⭐ Aktuális user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data.id);
      }
    };

    fetchUserId();
  }, [auth]);

  // ⭐ Vásárlás ellenőrzése
  useEffect(() => {
    const checkPurchase = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/user/purchases`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const hasPurchased = data.some(
          (item) =>
            item.id === id &&
            (item.item_type === "ebook" || item.item_type === "audiobook")
        );
        setHasAccess(hasPurchased);
      } catch (err) {
        console.error(err);
      }
    };

    checkPurchase();
  }, [id, auth]);

  // ⭐ Olvasás gomb
  const handleRead = () => {
    if (book.type === "ebook") navigate(`/ebook/${book.id}`);
    if (book.type === "audiobook") navigate(`/audiobook/${book.id}`);
  };

  // ⭐ Discount logika
  const hasDiscount = discount && discount.value > 0;
  const discountedPrice = hasDiscount
    ? Math.round(book.price * (1 - discount.value / 100))
    : null;

  // ⭐ Vélemény mentés
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Be kell jelentkezned.");
      return;
    }

    const token = await user.getIdToken();

    const res = await fetch(`${API_URL}/reviews/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    });

    if (res.ok) {
      const updated = await fetch(`${API_URL}/reviews/${id}`).then((r) =>
        r.json()
      );
      setComments(updated);
      setComment("");
      setRating(5);
    }
  };

  // ⭐ Vélemény törlése
  const handleDelete = async (reviewId) => {
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();

    const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setComments(comments.filter((c) => c.id !== reviewId));
    }
  };

  // ⭐ Kosárba adás
  const handleAddToCart = async () => {
    try {
      await addToCartBackend(book.id, 1, book.type);
      incrementCart();
      alert("Kosárba helyezve!");
    } catch (err) {
      alert("Hiba történt.");
    }
  };

  // ⭐ Ha adat még töltődik
  if (!book) {
    return <p className="text-center mt-10">Betöltés...</p>;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10 space-y-10">
      <div className="flex flex-col md:flex-row gap-10 items-start relative">
        <img
          src={book.cover_image_url}
          alt={book.title}
          className="w-72 h-auto shadow-lg rounded"
        />

        <div className="flex-1 space-y-4 relative w-full">
          {/* ⭐ Árak megjelenítése */}
          <div className="absolute right-0 top-0 flex flex-col items-end gap-2">
            {!hasAccess && hasDiscount ? (
              <>
                <p className="text-lg text-gray-500 line-through">
                  {book.price} Ft
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {discountedPrice} Ft{" "}
                  <span className="text-red-600 text-sm font-semibold">
                    (−{discount.value}%)
                  </span>
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-800">
                {book.price} Ft
              </p>
            )}

            {/* ⭐ Kosárba */}
            {!hasAccess && (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold px-5 py-2 rounded shadow"
              >
                <FaShoppingCart /> Kosárba
              </button>
            )}

            {/* ⭐ Akció címke */}
            {hasDiscount && !hasAccess && (
              <div className="bg-red-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow">
                Akció
              </div>
            )}

            {/* ⭐ Olvasás gomb */}
            {(book.type === "ebook" || book.type === "audiobook") && (
              <button
                onClick={handleRead}
                disabled={!hasAccess}
                className={`mt-2 px-5 py-2 rounded shadow font-bold ${
                  hasAccess
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Olvasás
              </button>
            )}
          </div>

          {/* ⭐ Könyv információk */}
          <h1 className="text-3xl font-bold text-green-900 pr-40">
            {book.title}
          </h1>

          <p className="text-lg text-gray-700">
            Szerző: <span className="font-semibold">{book.author}</span>
          </p>

          <p className="text-gray-600">Kiadó: {book.publisher}</p>
          <p className="text-gray-600">Típus: {book.type}</p>

          {book.categories?.length > 0 && (
            <p className="text-gray-600">
              Kategória: {book.categories.join(", ")}
            </p>
          )}

          <p className="text-gray-600">
            Átlagos értékelés:{" "}
            <span className="font-semibold text-yellow-600">
              {book.average_rating?.toFixed(1) ?? "0.0"} ★
            </span>
          </p>

          <p className="text-gray-700">{book.description}</p>
        </div>
      </div>

      {/* ⭐ Vélemények */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-green-900">Értékelés</h2>

        <div className="flex items-center gap-1 text-yellow-500 text-2xl">
          {[...Array(5)].map((_, i) => (
            <button
              key={i}
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
            className="w-full border rounded-lg p-3 shadow-sm"
            rows="4"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
          >
            Küldés
          </button>
        </form>
      </section>

      {/* ⭐ Vélemény lista */}
      {comments.length > 0 && (
        <section className="space-y-6 mt-10">
          <h3 className="text-xl font-bold text-green-900">
            Olvasói vélemények
          </h3>

          <div className="flex flex-col gap-6">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-[#fefae0] p-4 rounded-lg shadow-md border border-yellow-300 relative"
              >
                {c.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                )}

                <div className="flex items-center gap-1 mb-2 text-yellow-500">
                  {[...Array(c.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <p className="text-xs text-gray-400 mb-1">
                  {new Date(c.created_at).toLocaleDateString("hu-HU")}
                </p>

                <p className="text-gray-700">{c.comment}</p>

                <p className="text-xs text-gray-500 mt-1">– {c.display_name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
