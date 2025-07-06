import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import EbookReader from "../components/EbookReader";

export default function Ebook() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`http://localhost:3001/books/${id}`);
        if (!res.ok) throw new Error("Könyv nem található");
        const data = await res.json();

        // Ha van fájl URL, akkor letöltjük a tartalmat
        let content = ["A könyv szövege nem érhető el."];
        if (data.file_url && data.file_format === "txt") {
          const fileRes = await fetch(`http://localhost:3001${data.file_url}`);
          const text = await fileRes.text();

          // Oldalakra bontás 30 soronként (példa)
          const lines = text.split("\n");
          const pages = [];
          for (let i = 0; i < lines.length; i += 30) {
            pages.push(lines.slice(i, i + 30).join("\n"));
          }

          content = pages;
        }

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

  if (!book) {
    return <p className="text-center py-10 text-gray-500">E-könyv betöltése...</p>;
  }

  return (
    <div className="max-w-screen-md mx-auto px-6 py-10">
      <EbookReader book={book} />
    </div>
  );
}
