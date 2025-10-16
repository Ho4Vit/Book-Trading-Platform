// src/components/LoginModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import GoogleLogo from "@/assets/google_logo_icon.png";
import LoginImage from "@/assets/login.png";

const LoginModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await authApi.login(formData);
            if (res?.token) {
                // Cập nhật Zustand store
                login({
                    user: res.user,
                    token: res.token,
                    role: res.role,
                });

                toast.success("Đăng nhập thành công 🎉");

                // Điều hướng theo role
                switch (res.role) {
                    case "CUSTOMER":
                        navigate("/customer/home");
                        break;
                    case "SELLER":
                        navigate("/seller/dashboard");
                        break;
                    case "ADMIN":
                        navigate("/admin/dashboard");
                        break;
                    default:
                        navigate("/");
                }

                onClose(); // Đóng modal
            } else {
                toast.error("Đăng nhập thất bại, vui lòng kiểm tra thông tin.");
            }
        } catch (error) {
            toast.error("Sai tên đăng nhập hoặc mật khẩu.");
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

                {/* Form đăng nhập */}
                <div className="sm:w-1/2 px-8 md:px-12">
                    <h2 className="font-bold text-2xl text-[#4527a5] text-center">Đăng nhập</h2>
                    <p className="text-sm mt-6 text-[#6c57b1] text-opacity-70 text-center">
                        Nếu bạn đã có tài khoản, hãy đăng nhập ngay
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            className="p-2 mt-8 rounded-xl border"
                            type="text"
                            name="username"
                            placeholder="Tên đăng nhập"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <input
                            className="p-2 rounded-xl border"
                            type="password"
                            name="password"
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl text-white py-2 bg-indigo-500 hover:bg-indigo-600 transition-all"
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </button>
                    </form>

                    <div className="mt-8 grid grid-cols-3 items-center text-gray-400">
                        <hr className="border-gray-400" />
                        <p className="text-center text-sm">HOẶC</p>
                        <hr className="border-gray-400" />
                    </div>

                    <button className="bg-white border py-2 w-full rounded-xl mt-4 flex justify-center text-sm items-center hover:bg-gray-100">
                        <img className="w-6 mr-3" src={GoogleLogo} alt="Google logo" />
                        Đăng nhập bằng Google
                    </button>

                    <div className="mt-5 text-xs flex justify-between items-center">
                        <p>Chưa có tài khoản?</p>
                        <button
                            onClick={() => {
                                onClose();
                                navigate("/register");
                            }}
                            className="py-2 px-5 bg-white border rounded-xl hover:bg-gray-100"
                        >
                            Đăng ký ngay
                        </button>
                    </div>
                </div>

                {/* Ảnh minh họa */}
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