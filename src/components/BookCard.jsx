import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { addToCartBackend } from "../utils/cart";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import placeholderImage from "../assets/peldakonyv.png";
import { useCart } from "../context/CartContext";


export default function BookCard({ book }) {
  const bookId = book.id;
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [discount, setDiscount] = useState(null); // 🎯 akció adatok
  const [finalPrice, setFinalPrice] = useState(book.price);
  const auth = getAuth();
  const { incrementCart } = useCart();


  // 🔍 Ellenőrzés: a user már megvette-e
  useEffect(() => {
    const checkPurchase = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:3001/user/purchases", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;
        const data = await res.json();

        const currentType = (book.type || "").toLowerCase();
        const purchased = data.some((item) => {
          const itemType = (item.item_type || "").toLowerCase();
          return (
            item.id === bookId &&
            (itemType === currentType ||
              (itemType === "ebook" && currentType === "ebook") ||
              (itemType === "audiobook" && currentType === "audiobook"))
          );
        });

        setAlreadyPurchased(purchased);
      } catch (err) {
        console.error("Vásárlás ellenőrzési hiba:", err);
      }
    };

    checkPurchase();
  }, [auth, bookId, book.type]);

  // 💰 Akció lekérdezése a backendről
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/discounts/book/${bookId}`);
        if (!res.ok) return; // ha nincs akció, vagy 404
        const data = await res.json();

        if (data && data.value) {
          setDiscount(data.value);
          const newPrice = book.price - (book.price * data.value) / 100;
          setFinalPrice(Number(newPrice.toFixed(2)));
        } else {
          setDiscount(null);
          setFinalPrice(book.price);
        }
      } catch (err) {
        console.error("Akció lekérdezési hiba:", err);
      }
    };

    fetchDiscount();
  }, [bookId, book.price]);

  // 🛒 Kosárhoz adás
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (alreadyPurchased) {
      alert("Ezt a könyvet már megvásároltad!");
      return;
    }

    try {
      await addToCartBackend(bookId, 1, book.type);
      incrementCart(); // 🔥 kosár számláló frissítése
      alert("Kosárba helyezve!");
    } catch (err) {
      console.error("Kosárba helyezési hiba:", err);
      alert("Hiba: " + err.message);
    }
  };

  // 📘 Könyv típus megjelenítése
  const renderType = () => {
    switch (book.type) {
      case "ebook":
        return <p className="text-sm text-blue-600 font-semibold">E-könyv</p>;
      case "audiobook":
        return <p className="text-sm text-purple-600 font-semibold">Hangoskönyv</p>;
      default:
        return <p className="text-sm text-gray-700 font-semibold">Hagyományos könyv</p>;
    }
  };

  return (
    <Link
      to={`/book/${bookId}`}
      className="transform hover:scale-105 transition duration-300 block relative"
    >
      <div 
      data-testid="book-card"
      className="bg-[#fefae0] p-5 rounded-2xl shadow-xl hover:shadow-2xl text-center h-full border border-yellow-300 relative overflow-hidden">
        {/* 🔴 Akció szalag — csak ha van akció és a könyvet még nem vették meg */}
        {discount && !alreadyPurchased && (
          <div className="absolute top-0 left-0 bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-br-lg shadow-md z-10">
            -{discount}%
          </div>
        )}

        <img
          src={book.cover_image_url || placeholderImage}
          alt={book.title || "Borítókép nincs"}
          className="w-full h-[220px] object-contain rounded-md mb-3"
        />

        <h4 data-testid="book-title" className="text-lg font-bold text-green-900">
          {book.title}
        </h4>
        <p className="text-sm text-gray-600">
          Szerző: {book.author || "Ismeretlen"}
        </p>

        {renderType()}

        {/* 💵 Ár megjelenítés akcióval — csak ha nincs megvéve */}
        <div className="mt-2 mb-3">
          {discount && !alreadyPurchased ? (
            <>
              <p className="text-sm text-gray-500 line-through">
                {Number(book.price).toLocaleString()} Ft
              </p>
              <p className="text-lg font-semibold text-red-600">
                {finalPrice.toLocaleString()} Ft
              </p>
            </>
          ) : (
            <p className="text-md text-green-900 font-semibold">
              {Number(book.price).toLocaleString()} Ft
            </p>
          )}
        </div>

        <p className="text-yellow-600 text-sm font-semibold mb-1">
          ⭐ {Number(book.average_rating ?? book.avg_rating ?? 0).toFixed(1)} / 5
        </p>

        <div className="flex justify-center">
          <button
            data-testid="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={alreadyPurchased}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 shadow transition
              ${
                alreadyPurchased
                  ? "bg-gray-400 text-gray-700"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
          >
            <FaShoppingCart />
            {alreadyPurchased ? "Már megvásárolva" : "Kosárba"}
          </button>
        </div>
      </div>
    </Link>
  );
}
