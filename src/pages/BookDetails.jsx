import { FaShoppingCart, FaStar } from "react-icons/fa";
import placeholderImage from "../assets/peldakonyv.png";


const book = {
  id: 1,
  title: "Az Alkimista",
  author: "Paulo Coelho",
  price: 2990,
  publisher: "Európa Könyvkiadó",
  rating: 5,
  description:
    "Egy fiú kalandos útját követhetjük, aki saját sorsát és álmait keresi. Egy szimbólumokban gazdag, inspiráló történet.",
  cover: placeholderImage,
};

export default function BookDetails() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-10 items-start">
      {/* Borító */}
      <img
        src={book.cover}
        alt={book.title}
        className="w-72 h-auto shadow-lg rounded"
      />

      {/* Könyv adatok */}
      <div className="flex-1 space-y-4 relative w-full">
        {/* Ár + kosár jobb felső sarokban */}
        <div className="absolute right-0 top-0 flex flex-col items-end gap-2">
          <p className="text-2xl font-bold text-gray-800">{book.price} Ft</p>
          <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold px-5 py-2 rounded shadow">
            <FaShoppingCart />
            Kosárba
          </button>
        </div>

        <h1 className="text-3xl font-bold text-green-900 pr-40">{book.title}</h1>
        <p className="text-lg text-gray-700">
          Könyv szerzője: <span className="font-semibold">{book.author}</span>
        </p>
        <p className="text-gray-600">
          Kiadó: <span className="font-medium">{book.publisher}</span>
        </p>

        {/* ⭐ Értékelés */}
        <div className="flex items-center gap-1 text-yellow-500 text-xl">
          {[...Array(book.rating)].map((_, i) => (
            <FaStar key={i} />
          ))}
        </div>

        {/* Leírás */}
        <p className="text-sm leading-relaxed text-gray-800">
          {book.description}
        </p>
      </div>
    </div>
  );
}
