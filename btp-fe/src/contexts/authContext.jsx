// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, logoutUser } from "@/services/authService.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // { token, role, userId }
    const [loading, setLoading] = useState(true);

    // 🔹 Khi app khởi động, lấy thông tin từ localStorage
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");

        if (token && role && userId) {
            setUser({ token, role, userId });
        }
        setLoading(false);
    }, []);

    // 🔹 Hàm login (sử dụng authService)
    const login = async (username, password) => {
        try {
            const res = await loginUser({ username, password });

            if (res?.data) {
                const { token, role, userId } = res.data;

                // Lưu vào localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("role", role);
                localStorage.setItem("userId", userId);

                // Cập nhật state user
                setUser({ token, role, userId });

                if (role === "CUSTOMER") navigate("/customer/home");
                else if (role === "SELLER") navigate("/seller/dashboard");
                else if (role === "ADMIN") navigate("/admin/dashboard");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Login failed:", err);
            throw err; // để component xử lý lỗi hiển thị
        }
    };

    // 🔹 Hàm logout (sử dụng authService)
    const logout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.warn("Logout API failed, clearing localStorage anyway.");
        } finally {
            localStorage.clear();
            setUser(null);
            navigate("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
