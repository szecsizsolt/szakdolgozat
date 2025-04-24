import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";


export default function BookCard({ book }) {
  return (
    <Link
      to="/book"
      className="transform hover:scale-105 transition duration-300"
    >
      <div className="bg-[#fefae0] p-5 rounded-2xl shadow-xl hover:shadow-2xl text-center h-full border border-yellow-300">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-[220px] object-contain rounded-md mb-3"
        />
        <h4 className="text-lg font-bold text-green-900">{book.title}</h4>
        <p className="text-sm text-gray-600">Szerző: {book.author}</p>
        <p className="text-md text-green-900 font-semibold mt-1 mb-4">
          Ár: {book.price.toLocaleString()} Ft
        </p>
        <div className="flex justify-center">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow">
            <FaShoppingCart />
            Kosárba
          </button>
        </div>
      </div>
    </Link>
  );
}
