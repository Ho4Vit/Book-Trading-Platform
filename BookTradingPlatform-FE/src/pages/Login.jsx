import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "./Login.css";

function Login() {
    const { login } = useContext(AuthContext);
    const { fetchCart } = useContext(CartContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:8080/api/auth/login", {
                username,
                password
            });

            const userData = res.data.data; // { token, role, userId }

            // Lưu vào AuthContext
            login({ ...userData, username });

            // Xử lý role
            const role = userData.role.replace("ROLE_", "").toUpperCase();
            console.log("Role detected:", role); // debug

            if (role === "CUSTOMER") {
                fetchCart(userData.userId);   // fetch cart cho customer
                navigate("/");                // về trang Home
            } else if (role === "SELLER") {
                navigate("/seller/books");    // vào trang quản lý sách của seller
            } else if (role === "ADMIN") {
                navigate("/admin");           // vào trang admin
            } else {
                navigate("/");                // mặc định về Home
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError("Sai tài khoản hoặc mật khẩu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Đăng nhập</h2>
                {error && <p className="error">{error}</p>}
                <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
}

export default Login;
