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
  const [discount, setDiscount] = useState(null); // 🔹 akció adatok
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const { incrementCart } = useCart();


  // 🔹 Könyv betöltése
  useEffect(() => {
    fetch(`${API_URL}/books/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cover_image_url && !data.cover_image_url.startsWith("http")) {
          data.cover_image_url = `${API_URL}${data.cover_image_url}`;
        }
        setBook(data);
      })
      .catch((err) => {
        console.error("Könyv betöltési hiba:", err);
        alert("Nem sikerült betölteni a könyv adatokat.");
      });
  }, [id]);

  // 🔹 Akció lekérése
  useEffect(() => {
    if (!book) return;
    fetch(`${API_URL}/api/discounts/book/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Nincs akció");
        return res.json();
      })
      .then((data) => setDiscount(data))
      .catch(() => setDiscount(null));
  }, [book, id]);

  // 🔹 Vélemények betöltése
  useEffect(() => {
    fetch(`${API_URL}/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("Vélemény betöltési hiba:", err));
  }, [id]);

  // 🔹 Aktuális felhasználó ID lekérése
  useEffect(() => {
    const fetchUserId = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.id);
        }
      } catch (err) {
        console.error("Felhasználó lekérési hiba:", err);
      }
    };
    fetchUserId();
  }, [auth]);

  // 🔹 Vásárlás ellenőrzés
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
        console.error("Vásárlás ellenőrzési hiba:", err);
      }
    };
    checkPurchase();
  }, [id, auth]);

  // 🔹 Olvasás
  const handleRead = () => {
    if (book.type === "ebook") {
      navigate(`/ebook/${book.id}`);
    } else if (book.type === "audiobook") {
      navigate(`/audiobook/${book.id}`);
    }
  };

  // 🔹 Vélemény beküldése
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim() === "") return;

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Be kell jelentkezned a véleményezéshez.");
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
      } else {
        const err = await res.json();
        alert(err.error || "Hiba történt a mentéskor.");
      }
    } catch (err) {
      console.error("Hiba a vélemény mentésekor:", err);
    }
  };

  // 🔹 Vélemény törlése (csak saját)
  const handleDelete = async (reviewId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setComments(comments.filter((r) => r.id !== reviewId));
      } else {
        alert("Nem sikerült törölni a véleményt.");
      }
    } catch (err) {
      console.error("Hiba a vélemény törlésekor:", err);
    }
  };

  // 🔹 Kosárhoz adás
  const handleAddToCart = async () => {
    try {
      await addToCartBackend(book.id, 1, book.type);
      incrementCart(); // 🔥 frissíti a Navbar számlálót
      alert("Kosárba helyezve!");
    } catch (err) {
      console.error("Kosárba helyezési hiba:", err);
      alert("Hiba: " + err.message);
    }
  };

  // 🔹 Akciós ár kiszámítása
  const discountedPrice =
    discount && discount.value
      ? Math.round(book.price * (1 - discount.value / 100))
      : null;

  // 🔹 Dátum formázás
  const formatDate = (date) =>
    new Intl.DateTimeFormat("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));

  if (!book) {
    return <p className="text-center mt-10 text-gray-500">Könyv betöltése...</p>;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10 space-y-10">
      {/* Könyv adatok blokk */}
      <div className="flex flex-col md:flex-row gap-10 items-start relative">
        <img
          src={book.cover_image_url || "/placeholder.png"}
          alt={book.title}
          className="w-72 h-auto shadow-lg rounded"
        />

        <div className="flex-1 space-y-4 relative w-full">
          {/* Jobb felső sarok: ár, kosár, olvasás gomb */}
          <div className="absolute right-0 top-0 flex flex-col items-end gap-2">
            {/* 🔹 Akció csak ha NEM megvett könyv */}
            {!hasAccess && discount ? (
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
              <p className="text-2xl font-bold text-gray-800">{book.price} Ft</p>
            )}

            {/* 🔹 Kosár gomb */}
            {!hasAccess && (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold px-5 py-2 rounded shadow"
              >
                <FaShoppingCart />
                Kosárba
              </button>
            )}

            {/* 🔹 Akció címke csak ha nem megvett könyv */}
            {discount && !hasAccess && (
              <div className="mt-1 bg-red-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow flex items-center gap-1">
                 Akció
              </div>
            )}

            {/* 🔹 Olvasás gomb digitális könyveknél */}
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
                Olvasás
              </button>
            )}
          </div>

          <h1 className="text-3xl font-bold text-green-900 pr-40">
            {book.title}
          </h1>
          <p className="text-lg text-gray-700">
            Szerző:{" "}
            <span className="font-semibold">{book.author || "Ismeretlen"}</span>
          </p>
          <p className="text-gray-600">
            Kiadó: <span className="font-medium">{book.publisher}</span>
          </p>
          <p className="text-gray-600">
            Típus: <span className="font-medium">{book.type}</span>
          </p>
          {book.categories?.length > 0 && (
            <p className="text-gray-600">
              Kategória:{" "}
              <span className="font-medium">{book.categories.join(", ")}</span>
            </p>
          )}
          <p className="text-gray-600">
            Átlagos értékelés:{" "}
            <span className="font-semibold text-yellow-600">
              {book.average_rating ? book.average_rating.toFixed(1) : "0.0"} ★
            </span>
          </p>
          <p className="text-sm leading-relaxed text-gray-800">
            {book.description || "Nincs leírás."}
          </p>
        </div>
      </div>

      {/* Vélemények és értékelés */}
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
                    title="Törlés"
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
                  {formatDate(c.created_at)}
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
