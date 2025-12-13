import Carousel from "../components/Carousel";
import CategorySlider from "../components/CategorySlider";
import CustomerReviews from "../components/CustomerReviews";
import NewsletterSignup from "../components/NewsletterSignup";
import SearchBar from "../components/SearchBar";
import RecommendedBooks from "../components/RecommendedBooks";

// Főoldal
const Home = () => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 space-y-10 py-6">
      <SearchBar />
      <Carousel />
      <CategorySlider />
      <RecommendedBooks />
      <CustomerReviews />
      <NewsletterSignup />
    </div>
  );
};

export default Home;
