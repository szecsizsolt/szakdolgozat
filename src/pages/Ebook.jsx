import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EbookReader from "../components/EbookReader";

export default function Ebook() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // ✅ Az e-book adatokat (file_url, content stb.) innen kérjük le
        const res = await fetch(`http://localhost:3001/ebooks/${id}`);
        if (!res.ok) throw new Error("E-könyv nem található");

        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error("Hiba e-könyv betöltésekor:", err);
      }
    };

    fetchBook();
  }, [id]);

  if (!book) {
    return <p className="text-center py-10 text-gray-500">E-könyv betöltése...</p>;
  }

  return (
    <div className="max-w-screen-md mx-auto px-6 py-10">
      <EbookReader book={book} />
    </div>
  );
}
