import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

function Login() {
    const { login } = useContext(AuthContext);
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
            const res = await axios.post(
                "http://localhost:8080/api/auth/login",
                { username, password },
                { headers: { "Content-Type": "application/json" } }
            );

            const userData = res.data.data; // { token, role, userId }
            login({ ...userData, username }); // lưu vào context

            // Nếu backend trả role có prefix "ROLE_", loại bỏ
            const role = userData.role.replace("ROLE_", "").toUpperCase();

            if (role === "CUSTOMER") navigate("/");      // trang khách hàng
            else if (role === "ADMIN") navigate("/admin"); // trang admin
            else if (role === "SELLER") navigate("/seller"); // trang seller
            else navigate("/"); // fallback
        } catch (err) {
            setError("Sai tài khoản hoặc mật khẩu!");
            console.error("Login failed:", err);
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
