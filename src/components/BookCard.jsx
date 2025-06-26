import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { addToCartBackend } from "../utils/cart";

export default function BookCard({ book }) {
  const handleAddToCart = async (e) => {
    e.preventDefault();     // ne kövesse a <Link> hivatkozást
    e.stopPropagation();    // ne triggerelje a szülő kattintást

    try {
      await addToCartBackend(book.id);
      alert("Kosárba helyezve!");
    } catch (err) {
      alert("Hiba: " + err.message);
    }
  };

  return (
    <Link
      to={`/book/${book.id}`}
      className="transform hover:scale-105 transition duration-300"
    >
      <div className="bg-[#fefae0] p-5 rounded-2xl shadow-xl hover:shadow-2xl text-center h-full border border-yellow-300">
        {book.cover_image_url && (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-[220px] object-contain rounded-md mb-3"
          />
        )}

        <h4 className="text-lg font-bold text-green-900">{book.title}</h4>
        <p className="text-sm text-gray-600">Szerző: {book.author}</p>
        <p className="text-md text-green-900 font-semibold mt-1 mb-4">
          Ár: {Number(book.price).toLocaleString()} Ft
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleAddToCart}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow"
          >
            <FaShoppingCart />
            Kosárba
          </button>
        </div>
      </div>
    </Link>
  );
}
