import BookListGeneric from "../components/BookListGeneric";

// Oldal komponens: hangoskönyvek listázása a BookListGeneric segítségével
export default function AudiobookListPage() {
  return (
    <BookListGeneric
      apiUrl="http://localhost:3001/audiobooks" // Backend végpont: hangoskönyvek
      title="Hangoskönyvek"                      // Oldalcím
    />
  );
}
