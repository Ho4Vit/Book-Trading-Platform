import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BookDetail from "./pages/BookDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Profile from "./pages/Profile.jsx";
import Checkout from "./pages/Checkout.jsx";
import SellerBookPage from "./pages/SellerBookPage.jsx";
import AdminPage from "./pages/AdminPage.jsx"; // trang quản lý sách của seller

function App() {
    return (
        <>
            <Header />
            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/books/:id" element={<BookDetail />} />

                <Route path="/login" element={<Login />} />

                <Route path="/cart" element={<Cart />} />

                <Route path="/profile" element={<Profile />} />

                <Route path="/checkout/:orderId" element={<Checkout />} />

                <Route path="/seller/books" element={<SellerBookPage />} />

                <Route path="/admin" element={<AdminPage />} />

            </Routes>
            <Footer />
        </>
    );
}

export default App;
