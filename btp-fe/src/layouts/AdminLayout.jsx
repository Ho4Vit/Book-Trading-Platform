import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function AdminLayout() {
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
                    ⚙️ Admin Dashboard
                </Link>
                <nav className="space-x-4">
                    <Link to="/admin">Tổng quan</Link>
                    <Link to="/admin/books">Quản lý sách</Link>
                    <Link to="/admin/users">Người dùng</Link>
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
