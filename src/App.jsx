import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import BookList from "./pages/BookList";
import BookDetails from "./pages/BookDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Audio from "./pages/Audio";
import Ebook from "./pages/Ebook";



function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/book" element={<BookDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/audio" element={<Audio />} />
        <Route path="/ebooks" element={<Ebook />} />


      </Routes>
    </Router>
  );
}

export default App;
