import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "./Header.css";

function Header() {
    const { auth, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="header">
            <div className="logo">📚 BookStore</div>
            <nav className="nav">
                <Link to="/">Home</Link>
                <Link to="/books">Books</Link>
                {auth ? (
                    <>
                        <span className="user-info">Xin chào, {auth.username}</span>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login">Login</Link>
                )}
                <Link to="/cart" className="cart-link">
                    Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
            </nav>
        </header>
    );
}

export default Header;
