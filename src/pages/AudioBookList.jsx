import BookListGeneric from "../components/BookListGeneric";

// Hangoskönyvek listaoldal
export default function AudiobookListPage() {
  return (
    <BookListGeneric
      apiUrl="http://localhost:3001/audiobooks"
      title="Hangoskönyvek"
    />
  );
}
