import { useState } from "react";
import { FaShoppingCart, FaStar, FaTrash } from "react-icons/fa";
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
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [comments, setComments] = useState([
    { rating: 5, text: "Nagyon jó könyv.", date: new Date() },
    { rating: 1, text: "Nekem nem tetszett.", date: new Date() },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim() !== "") {
      setComments([
        ...comments,
        {
          rating,
          text: comment,
          date: new Date(),
        },
      ]);
      setComment("");
      setRating(5);
    }
  };

  const handleDelete = (index) => {
    const newComments = [...comments];
    newComments.splice(index, 1);
    setComments(newComments);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10 space-y-10">
      {/* Könyv rész */}
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <img
          src={book.cover}
          alt={book.title}
          className="w-72 h-auto shadow-lg rounded"
        />

        <div className="flex-1 space-y-4 relative w-full">
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

          <div className="flex items-center gap-1 text-yellow-500 text-xl">
            {[...Array(book.rating)].map((_, i) => (
              <FaStar key={i} />
            ))}
          </div>

          <p className="text-sm leading-relaxed text-gray-800">
            {book.description}
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
                {/* Törlés ikon */}
                <button
                  onClick={() => handleDelete(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Törlés"
                >
                  <FaTrash />
                </button>

                {/* Csillagok */}
                <div className="flex items-center gap-1 mb-2 text-yellow-500">
                  {[...Array(c.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                {/* Dátum */}
                <p className="text-xs text-gray-400 mb-1">{formatDate(c.date)}</p>

                {/* Vélemény szöveg */}
                <p className="text-gray-700">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
