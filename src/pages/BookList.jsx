import BookListGeneric from "../components/BookListGeneric";

export default function BookListPage() {
  return (
    <BookListGeneric
      apiUrl="http://localhost:3001/books"
      title="📚 Könyvek"
    />
  );
}
