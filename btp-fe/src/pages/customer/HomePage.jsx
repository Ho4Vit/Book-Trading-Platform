import React, { useEffect, useState } from "react";
import { getAllBooks } from "@/services/bookService.js";
import BookCard from "../../components/customer/BookCard.jsx";
import LoginModal from "@/pages/customer/LoginModal.jsx"; // 👈 import modal

const HomePage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showLogin, setShowLogin] = useState(false); // 👈 state cho popup

    const itemsPerPage = 12;

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await getAllBooks();
                const list = data?.data || data;
                setBooks(list);
            } catch (error) {
                console.error("Error fetching books:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const filteredBooks = books.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
            {/* HERO SECTION */}
            <section className="relative text-center py-20 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg">
                <h1 className="text-5xl font-extrabold mb-4 drop-shadow-md">
                    📚 Welcome to Book Haven
                </h1>
                <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-8">
                    Discover thousands of books from every genre — adventure, romance,
                    science, and more.
                </p>

                {/* Nút mở popup login */}
                <button
                    onClick={() => setShowLogin(true)}
                    className="mt-4 px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition"
                >
                    Login to your account
                </button>

                {/* Search Bar */}
                <div className="mt-6 flex justify-center">
                    <input
                        type="text"
                        placeholder="Search for a book title..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-80 md:w-1/3 px-4 py-3 rounded-l-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    />
                    <button className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-r-xl hover:bg-yellow-300 transition">
                        🔍 Search
                    </button>
                </div>
            </section>

            {/* BOOK GRID */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center text-gray-600 text-lg animate-pulse">
                        Loading books...
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div className="text-center text-gray-500 text-lg">No books found.</div>
                ) : (
                    <>
                        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {currentBooks.map((book) => (
                                <div
                                    key={book.id}
                                    className="bg-white shadow-md rounded-xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    <BookCard book={book} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center items-center mt-10 space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg border ${
                                    currentPage === 1
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-indigo-600 hover:bg-indigo-50"
                                }`}
                            >
                                ← Prev
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToPage(i + 1)}
                                    className={`px-4 py-2 rounded-lg border transition-all ${
                                        currentPage === i + 1
                                            ? "bg-indigo-600 text-white font-semibold"
                                            : "bg-white text-gray-700 hover:bg-indigo-50"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg border ${
                                    currentPage === totalPages
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-indigo-600 hover:bg-indigo-50"
                                }`}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}
            </section>

            {/* FOOTER */}
            <footer className="text-center py-6 border-t border-gray-200 bg-white">
                <p className="text-gray-500 text-sm">
                    © 2025 Book Haven. All rights reserved.
                </p>
            </footer>

            {/* Login Popup */}
            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    );
};

export default HomePage;
