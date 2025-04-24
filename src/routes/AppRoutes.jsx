import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import BookDetails from '../pages/BookDetails';
import Cart from '../pages/Cart';
import BookList from '../pages/BookList';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/books/:id" element={<BookDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/books" element={<BookList />} />
    </Routes>
  );
};

export default AppRoutes;
