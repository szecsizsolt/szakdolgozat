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
import Footer from "./components/Footer";
import Kapcsolat from "./pages/info/Kapcsolat";
import GYIK from "./pages/info/GYIK";
import Adatvedelem from "./pages/info/Adatvedelem";
import Aszf from "./pages/info/Aszf";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminRoute from "./components/AdminRoute";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBook from "./pages/admin/ManageBook";
import ManageEBook from "./pages/admin/ManageEBook";
import ManageAudioBook from "./pages/admin/ManageAudioBook";


function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="/ebooks" element={<Ebook />} />
            <Route path="/kapcsolat" element={<Kapcsolat />} />
            <Route path="/gyik" element={<GYIK />} />
            <Route path="/adatvedelem" element={<Adatvedelem />} />
            <Route path="/aszf" element={<Aszf />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/add-book" element={<AdminRoute><ManageBook /></AdminRoute>} />
            <Route path="/admin/ebook" element={<AdminRoute><ManageEBook /></AdminRoute>} />
            <Route path="/admin/audio" element={<AdminRoute><ManageAudioBook /></AdminRoute>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/book/:id" element={<BookDetails />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
