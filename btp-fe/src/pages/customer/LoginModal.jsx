// src/components/LoginModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/services/authService.js";
import GoogleLogo from "@/assets/google_logo_icon.png";
import LoginImage from "@/assets/login.png";

const LoginModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null; // nếu modal tắt thì không render gì

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await loginUser(formData);
            if (res?.data) {
                const { token, role, userId } = res.data;
                localStorage.setItem("token", token);
                localStorage.setItem("role", role);
                localStorage.setItem("userId", userId);

                if (role === "CUSTOMER") navigate("/customer/home");
                else if (role === "SELLER") navigate("/seller/dashboard");
                else if (role === "ADMIN") navigate("/admin/dashboard");

                onClose(); // đóng popup sau khi đăng nhập
            }
        } catch (err) {
            setError("Invalid username or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#f7faff] flex rounded-2xl shadow-xl max-w-3xl w-full p-6 relative">
                {/* Nút X để đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
                >
                    ✕
                </button>

                {/* Form */}
                <div className="sm:w-1/2 px-8 md:px-12">
                    <h2 className="font-bold text-2xl text-[#4527a5] text-center">Login</h2>
                    <p className="text-sm mt-6 text-[#6c57b1] text-opacity-70 text-center">
                        If you already a member, easily log in
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            className="p-2 mt-8 rounded-xl border"
                            type="text"
                            name="username"
                            placeholder="Your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <input
                            className="p-2 rounded-xl border"
                            type="password"
                            name="password"
                            placeholder="Your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl text-white py-2 bg-indigo-500 hover:bg-indigo-600 transition-all"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-8 grid grid-cols-3 items-center text-gray-400">
                        <hr className="border-gray-400" />
                        <p className="text-center text-sm">OR</p>
                        <hr className="border-gray-400" />
                    </div>

                    <button className="bg-white border py-2 w-full rounded-xl mt-4 flex justify-center text-sm items-center hover:bg-gray-100">
                        <img className="w-6 mr-3" src={GoogleLogo} alt="Google logo" />
                        Login with Google
                    </button>

                    <div className="mt-5 text-xs flex justify-between items-center">
                        <p>Don’t have an account?</p>
                        <button
                            onClick={() => navigate("/register")}
                            className="py-2 px-5 bg-white border rounded-xl hover:bg-gray-100"
                        >
                            Register
                        </button>
                    </div>
                </div>

                {/* Hình bên phải */}
                <div className="sm:block hidden w-1/2">
                    <img
                        className="rounded-2xl object-cover h-full w-full"
                        src={LoginImage}
                        alt="login"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
