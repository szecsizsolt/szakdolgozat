import BookListGeneric from "../components/BookListGeneric";

// E-könyvek listázása az általános listakomponenssel
export default function EbookListPage() {
  return (
    <BookListGeneric
      apiUrl="http://localhost:3001/ebooks"
      title="E-könyvek"
    />
  );
}
