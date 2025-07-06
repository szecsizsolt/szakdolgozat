import BookListGeneric from "../components/BookListGeneric";

export default function EbookListPage() {
  return (
    <BookListGeneric
      apiUrl="http://localhost:3001/ebooks"
      title="E-könyvek"
    />
  );
}
