import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";

const LoginModal = ({ onClose }) => {
    const { login } = useAuthStore();
    const [form, setForm] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await authApi.login(form); // POST username, password

            // ✅ BE trả về: token, role, userId
            if (res?.token) {
                login({
                    token: res.token,
                    role: res.role,
                    userId: res.userId,
                });
                toast.success("Đăng nhập thành công 🎉");
                onClose();
            } else {
                toast.error("Sai tài khoản hoặc mật khẩu");
            }
        } catch (error) {
            toast.error("Không thể đăng nhập. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[60]">
            <div className="bg-white rounded-xl shadow-2xl w-[400px] p-6 animate-scale-in">
                <h2 className="text-2xl font-bold text-indigo-600 text-center mb-4">
                    Đăng nhập
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Tên đăng nhập"
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Mật khẩu"
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>
                <button
                    onClick={onClose}
                    className="mt-4 text-gray-500 hover:text-gray-700 text-sm w-full text-center"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default LoginModal;