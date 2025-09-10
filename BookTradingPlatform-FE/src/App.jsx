import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BookDetail from "./pages/BookDetail.jsx";
import Cart from "./pages/Cart.jsx";

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<Cart />} /> {/* 👈 thêm route này */}
            </Routes>
            <Footer />
        </>
    );
}

export default App;
