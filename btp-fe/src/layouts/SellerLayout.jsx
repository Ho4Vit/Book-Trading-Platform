import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";

export default function SellerLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        toast.success("Đã đăng xuất!");
        navigate("/login");
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
