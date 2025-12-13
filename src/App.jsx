import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import BookList from "./pages/BookList";
import BookDetails from "./pages/BookDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

import Ebook from "./pages/Ebook";
import Audio from "./pages/Audio";
import EbookList from "./pages/EbookList";
import AudiobookList from "./pages/AudioBookList";
import MyDigitalBooks from "./pages/MyDigitalBooks";

import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

import Kapcsolat from "./pages/info/Kapcsolat";
import GYIK from "./pages/info/GYIK";
import Adatvedelem from "./pages/info/Adatvedelem";
import Aszf from "./pages/info/Aszf";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBook from "./pages/admin/ManageBook";
import ManageEBook from "./pages/admin/ManageEBook";
import ManageAudioBook from "./pages/admin/ManageAudioBook";
import ManageBlog from "./pages/admin/ManageBlog";
import ManageHomePage from "./pages/admin/ManageHomePage";
import DiscountManager from "./pages/admin/DiscountManager";
import Orders from "./pages/admin/Orders";

import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/books" element={<BookList />} />
            <Route path="/book/:id" element={<BookDetails />} />

            <Route path="/ebooks" element={<EbookList />} />
            <Route path="/ebook/:id" element={<Ebook />} />

            <Route path="/audio" element={<AudiobookList />} />
            <Route path="/audiobook/:id" element={<Audio />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/my-digital-books" element={<MyDigitalBooks />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />

            <Route path="/kapcsolat" element={<Kapcsolat />} />
            <Route path="/gyik" element={<GYIK />} />
            <Route path="/adatvedelem" element={<Adatvedelem />} />
            <Route path="/aszf" element={<Aszf />} />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/add-book"
              element={
                <AdminRoute>
                  <ManageBook />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/ebook"
              element={
                <AdminRoute>
                  <ManageEBook />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/audio"
              element={
                <AdminRoute>
                  <ManageAudioBook />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <Orders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/blog"
              element={
                <AdminRoute>
                  <ManageBlog />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/homepage"
              element={
                <AdminRoute>
                  <ManageHomePage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/discounts"
              element={
                <AdminRoute>
                  <DiscountManager />
                </AdminRoute>
              }
            />

            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
