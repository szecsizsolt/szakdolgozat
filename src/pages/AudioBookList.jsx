import BookListGeneric from "../components/BookListGeneric";

export default function AudiobookListPage() {
  return (
    <BookListGeneric
      apiUrl="http://localhost:3001/audiobooks"
      title="🎧 Hangoskönyvek"
    />
  );
}
