import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import BookCard from "../components/BookCard";

export default function MyDigitalBooks() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Vásárolt digitális könyvek lekérése
  const fetchPurchases = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3001/user/purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Vásárlások lekérdezése sikertelen:", res.status);
        return;
      }

      const data = await res.json();

      const digitalOnly = data.filter(
        (item) => item.item_type === "ebook" || item.item_type === "audiobook"
      );

      const formatted = digitalOnly.map((item) => ({
        ...item,
        cover_image_url: item.cover_image_url?.startsWith("http")
          ? item.cover_image_url
          : `http://localhost:3001${item.cover_image_url || ""}`,
      }));

      setPurchases(formatted);
    } catch (err) {
      console.error("Vásárlások lekérdezési hiba:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  if (loading) {
    return <p className="text-center py-10 text-gray-500">Betöltés...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-green-900">
        Megvásárolt digitális könyveim
      </h1>

      {purchases.length === 0 ? (
        <p className="text-gray-600">
          Még nem vásároltál e-könyvet vagy hangoskönyvet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {purchases.map((book) => (
            <BookCard key={book.purchase_id || book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
