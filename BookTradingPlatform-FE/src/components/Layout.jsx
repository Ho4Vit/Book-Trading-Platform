import React, { useEffect, useState } from "react";
import { getAllBooks } from "../api/bookApi";
import "./Layout.css";

const MainLayout = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        getAllBooks()
            .then((res) => setBooks(res.data.slice(0, 5)))
            .catch((err) => console.error("Lỗi khi lấy sách:", err));
    }, []);

    return (
        <div className="layout-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <h1 className="logo">DABS Bookstore</h1>
                    <nav className="nav">
                        <a href="/">Home</a>
                        <a href="/about">About</a>
                        <a href="/contact">Contact</a>
                    </nav>
                </div>
            </header>

            {/* Main content */}
            <main className="main-content">
                <h2 className="section-title">Top 5 Featured Books</h2>
                <div className="book-grid">
                    {books.map((book) => (
                        <div key={book.id} className="book-card">
                            <img
                                src={book.imageUrl || "/default-book.jpg"}
                                alt={book.title}
                                className="book-image"
                            />
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-description">{book.description}</p>
                            <p className="book-price">${book.price}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2025 DABS Bookstore. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default MainLayout;
