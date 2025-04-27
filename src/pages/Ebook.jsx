import EbookReader from "../components/EbookReader";

// Dummy könyv tartalom generálása (120 oldal)
const dummyContent = Array.from({ length: 120 }, (_, i) => `Ez itt a(z) ${i + 1}. oldal tartalma.`);

const dummyBook = {
  title: "Elveszett Város",
  author: "Júlia Horváth",
  totalPages: 120,
  content: dummyContent,
};

export default function Ebook() {
  return (
    <div className="max-w-screen-md mx-auto px-6 py-10">
      <EbookReader book={dummyBook} />
    </div>
  );
}
