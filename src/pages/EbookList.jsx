import BookListGeneric from "../components/BookListGeneric";

// Oldal komponens: általános könyvlista használata e-könyvekre
export default function EbookListPage() {
  return (
    <BookListGeneric
      apiUrl="http://localhost:3001/ebooks" // Backend végpont e-könyvekhez
      title="E-könyvek"                      // Oldal címe
    />
  );
}
