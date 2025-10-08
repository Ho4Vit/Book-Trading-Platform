// src/components/Header.jsx
import React, { useState } from "react";
import LoginModal from "@/pages/customer/LoginModal";

const Header = () => {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <header className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">📖 Book Store</h1>

            <nav className="flex items-center space-x-6">
                <a href="/" className="text-gray-700 hover:text-indigo-600">
                    Home
                </a>
                <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    Login
                </button>
            </nav>

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </header>
    );
};

export default Header;
