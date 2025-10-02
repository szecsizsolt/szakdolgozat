import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EbookReader from "../components/EbookReader";

// Segédfüggvény: txt fájl tartalmát lapokra bontja
const splitTextIntoPages = (text, linesPerPage = 30) => {
  const lines = text.split("\n");
  const pages = [];

  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage).join("\n"));
  }

  return pages;
};

export default function Ebook() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        // Könyv alapadatainak lekérése
        const res = await fetch(`http://localhost:3001/books/${id}`);
        if (!res.ok) throw new Error("Könyv nem található");
        const data = await res.json();

        let content = ["A könyv szövege nem érhető el."];

        // Ha a könyv rendelkezik fájl URL-lel és txt formátumban van
        if (data.file_url && data.file_format === "txt") {
          const fileRes = await fetch(`http://localhost:3001${data.file_url}`);
          const text = await fileRes.text();

          // Tartalom oldalakra bontva
          content = splitTextIntoPages(text);
        }

        // Könyv adatok + feldolgozott tartalom mentése state-be
        setBook({
          ...data,
          totalPages: content.length,
          content,
        });
      } catch (err) {
        console.error("Hiba e-könyv betöltésekor:", err);
      }
    };

    fetchBook();
  }, [id]);

  // Betöltés közben
  if (!book) {
    return <p className="text-center py-10 text-gray-500">E-könyv betöltése...</p>;
  }

  return (
    <div className="max-w-screen-md mx-auto px-6 py-10">
      {/* E-könyv olvasó komponens */}
      <EbookReader book={book} />
    </div>
  );
}
