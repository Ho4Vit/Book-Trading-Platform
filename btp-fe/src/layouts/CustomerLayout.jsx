import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function CustomerLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        toast.success("Đã đăng xuất!");
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <Link to="/" className="font-bold text-lg text-blue-600">
                    📚 BookStore
                </Link>
                <nav className="space-x-4">
                    <Link to="/customer">Dashboard</Link>
                    <Link to="/customer/profile">Hồ sơ</Link>
                    <Link to="/customer/orders">Đơn hàng</Link>
                    <button onClick={handleLogout} className="text-red-500 font-medium ml-4">
                        Đăng xuất
                    </button>
                </nav>
            </header>

            <main className="flex-1 p-6 bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
}
