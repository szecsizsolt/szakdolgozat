import BookListGeneric from "../components/BookListGeneric";

// Oldal komponens: az összes könyvet listázza a BookListGeneric segítségével
export default function BookListPage() {
  return (
    <BookListGeneric
      apiUrl="http://localhost:3001/books" // Backend végpont: minden könyv
      title="Könyvek"                      // Oldalcím
    />
  );
}
