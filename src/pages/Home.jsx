import BookCard from "../components/BookCard";
import Carousel from "../components/Carousel";
import CategorySlider from "../components/CategorySlider";
import CustomerReviews from "../components/CustomerReviews";
import NewsletterSignup from "../components/NewsletterSignup";
import SearchBar from "../components/SearchBar";

// Assetek
import placeholderImage from "../assets/peldakonyv.png";

// Dummy adatok (később API-ból jön majd)
const dummyBooks = [
  { id: 1, title: "Az alkimista", author: "Paulo Coelho", price: 2990, image: placeholderImage },
  { id: 2, title: "1984", author: "George Orwell", price: 3490, image: placeholderImage },
  { id: 3, title: "A Gyűrűk Ura", author: "J.R.R. Tolkien", price: 5990, image: placeholderImage },
  { id: 4, title: "Harry Potter", author: "J.K. Rowling", price: 3990, image: placeholderImage },
  { id: 5, title: "A Hobbit", author: "J.R.R. Tolkien", price: 2790, image: placeholderImage },
  { id: 6, title: "Büszkeség és balítélet", author: "Jane Austen", price: 3190, image: placeholderImage },
  { id: 7, title: "Dűne", author: "Frank Herbert", price: 4990, image: placeholderImage },
  { id: 8, title: "A szolgálólány meséje", author: "Margaret Atwood", price: 3590, image: placeholderImage },
];

// Könyv szekció komponens (külön kiszervezve az átláthatóság miatt)
const RecommendedBooks = () => (
  <section>
    <h2 className="text-2xl font-extrabold text-center text-green-900 border-b-2 border-yellow-400 w-fit mx-auto pb-2">
      Ajánlott könyvek
    </h2>
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
      {dummyBooks.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  </section>
);

// Főoldal komponens
const Home = () => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 space-y-10 py-6">
      {/* Keresőmező a könyvekhez */}
      <SearchBar />

      {/* Kiemelt bannerek/képek slider */}
      <Carousel />

      {/* Kategória választó slider */}
      <CategorySlider />

      {/* Ajánlott könyvek szekció */}
      <RecommendedBooks />

      {/* Vásárlói vélemények */}
      <CustomerReviews />

      {/* Hírlevél feliratkozás */}
      <NewsletterSignup />
    </div>
  );
};

export default Home;
