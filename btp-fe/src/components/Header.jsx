import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { sellerApi } from "@/api/index.js";
import { customerApi } from "@/api/index.js";
import useCustomQuery from "@/hooks/useCustomQuery";
import toast from "react-hot-toast";
import LoginModal from "@/components/LoginModal";

const Header = () => {
    const navigate = useNavigate();
    const { role, logout, userId } = useAuthStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const dropdownRef = useRef(null);

    const { data: userProfile } = useCustomQuery(
        ["user-profile", role, userId],
        role === "CUSTOMER"
            ? () => customerApi.getCustomerById(userId)
            : () => sellerApi.getSellerById(userId),
        { enabled: !!userId && !!role } // chỉ fetch khi đã login
    );

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success("Đã đăng xuất thành công!");
        navigate("/");
    };

    return (
        <>
            {/* Login Modal */}
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <div
                        onClick={() => navigate("/")}
                        className="text-2xl font-bold text-indigo-600 cursor-pointer select-none"
                    >
                        📚 BookStore
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <button
                            onClick={() => navigate("/")}
                            className="text-gray-700 hover:text-indigo-600 font-medium transition"
                        >
                            Trang chủ
                        </button>

                        <button
                            onClick={() => navigate("/books")}
                            className="text-gray-700 hover:text-indigo-600 font-medium transition"
                        >
                            Sách
                        </button>

                        {role === "SELLER" && (
                            <button
                                onClick={() => navigate("/seller/dashboard")}
                                className="text-gray-700 hover:text-indigo-600 font-medium transition"
                            >
                                Quản lý bán hàng
                            </button>
                        )}
                    </nav>

                    {/* Auth Section */}
                    <div className="relative" ref={dropdownRef}>
                        {!userId ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogin(true)}
                                    className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate("/register")}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-3 cursor-pointer select-none"
                                onClick={() => setMenuOpen((prev) => !prev)}
                            >
                                <img
                                    src={
                                        userProfile?.profileImage ||
                                        `https://api.dicebear.com/9.x/identicon/svg?seed=${userId}`
                                    }
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                                />
                                <span className="font-medium text-gray-700 hover:text-indigo-600">
                  {userProfile?.username || "Người dùng"}
                </span>

                                {/* Dropdown */}
                                {menuOpen && (
                                    <div className="absolute right-0 top-12 bg-white shadow-xl rounded-xl border py-2 w-56 animate-fade-in">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm text-gray-600">Đăng nhập với vai trò:</p>
                                            <p className="text-indigo-600 font-semibold capitalize">{role}</p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                navigate("/profile");
                                                setMenuOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700"
                                        >
                                            Thông tin cá nhân
                                        </button>

                                        {role === "SELLER" && (
                                            <button
                                                onClick={() => {
                                                    navigate("/seller/dashboard");
                                                    setMenuOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700"
                                            >
                                                Trang quản lý bán hàng
                                            </button>
                                        )}

                                        {role === "CUSTOMER" && (
                                            <button
                                                onClick={() => {
                                                    navigate("/customer/orders");
                                                    setMenuOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700"
                                            >
                                                Đơn hàng của tôi
                                            </button>
                                        )}

                                        <hr className="my-2" />

                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;