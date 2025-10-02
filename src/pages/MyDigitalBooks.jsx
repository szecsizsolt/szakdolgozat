import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import BookCard from "../components/BookCard";

export default function MyDigitalBooks() {
  const [purchases, setPurchases] = useState([]); // Vásárolt digitális könyvek listája
  const [loading, setLoading] = useState(true);   // Betöltés állapot
  const auth = getAuth();

  // Vásárlások lekérése a backendről
  const fetchPurchases = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Firebase token lekérése
      const token = await user.getIdToken();

      // Lekérés a backendtől a felhasználó vásárlásaira
      const res = await fetch("http://localhost:3001/user/purchases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // Csak digitális tartalmak szűrése (ebook, audiobook)
      const filtered = data
        .filter((item) => item.item_type === "ebook" || item.item_type === "audiobook")
        .map((item) => ({
          ...item,
          // Relatív kép elérési útvonal javítása abszolút URL-re
          cover_image_url: item.cover_image_url?.startsWith("http")
            ? item.cover_image_url
            : `http://localhost:3001${item.cover_image_url}`,
        }));

      setPurchases(filtered);
    } catch (err) {
      console.error("Hiba a vásárlások lekérdezésekor:", err);
    } finally {
      setLoading(false);
    }
  };

  // Komponens betöltéskor lekérdezi a vásárlásokat
  useEffect(() => {
    fetchPurchases();
  }, []);

  // Betöltés közben
  if (loading) {
    return <p className="text-center py-10 text-gray-500">Betöltés...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-green-900">
        Megvásárolt digitális könyveim
      </h1>

      {/* Ha nincs vásárlás */}
      {purchases.length === 0 ? (
        <p className="text-gray-600">
          Még nem vásároltál e-könyvet vagy hangoskönyvet.
        </p>
      ) : (
        // Vásárolt könyvek listázása
        <div className="grid md:grid-cols-3 gap-6">
          {purchases.map((book) => (
            <BookCard key={book.book_id || book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
