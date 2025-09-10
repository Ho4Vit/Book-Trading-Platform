// src/components/Header.js
import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import axios from "axios";
import "./Header.css";

function Header() {
    const { auth, logout } = useContext(AuthContext);
    const { cartCount, clearCartContext } = useContext(CartContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        clearCartContext();
        navigate("/login");
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    useEffect(() => {
        if (auth?.userId && auth?.role) {
            let url = "";
            const role = auth.role.replace("ROLE_", "").toUpperCase();

            if (role === "CUSTOMER") {
                url = `http://localhost:8080/api/v1/customers/getbyid/${auth.userId}`;
            } else if (role === "SELLER") {
                url = `http://localhost:8080/api/v1/sellers/getbyid/${auth.userId}`;
            } else if (role === "ADMIN") {
                // giả sử có API riêng cho admin
                url = `http://localhost:8080/api/v1/admins/getbyid/${auth.userId}`;
            }

            if (url) {
                axios
                    .get(url, {
                        headers: {
                            Authorization: `Bearer ${auth.token}`, // nếu backend yêu cầu JWT
                        },
                    })
                    .then((res) => {
                        if (res.data.statusCode === "SUC_200") {
                            setProfile(res.data.data);
                        }
                    })
                    .catch((err) => console.error("Lỗi lấy profile:", err));
            }
        }
    }, [auth]);

    // Click ra ngoài dropdown để đóng
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="header">
            <div className="logo">📚 BookStore</div>
            <nav className="nav">
                <button onClick={() => navigate("/")}>Home</button>
                <button onClick={() => navigate("/books")}>Books</button>

                {auth && profile ? (
                    <div className="user-dropdown" ref={dropdownRef}>
                        <div className="user-info" onClick={toggleDropdown}>
                            <img
                                src={profile.profileImage || "/default-avatar.png"}
                                alt="Avatar"
                                className="avatar"
                            />
                            <span>
                                {profile.fullName || profile.storeName || "Người dùng"}
                            </span>
                        </div>

                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <button
                                    onClick={() => {
                                        navigate("/profile");
                                        setDropdownOpen(false);
                                    }}
                                >
                                    Xem profile
                                </button>
                                {auth.role.includes("SELLER") && (
                                    <button
                                        onClick={() => {
                                            navigate("/seller/books");
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        Quản lý sách
                                    </button>
                                )}
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={() => navigate("/login")}>Login</button>
                )}

                <button
                    className="cart-link"
                    onClick={() => navigate("/cart")}
                >
                    Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
            </nav>
        </header>
    );
}

export default Header;
