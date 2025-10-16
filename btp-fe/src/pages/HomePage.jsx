import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { bookApi } from "@/api"; // ✅ import service API
import useCustomQuery from "@/hooks/useCustomQuery"; // ✅ dùng query mới
import Header from "@/components/Header.jsx";

export default function HomePage() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // ✅ Dùng React Query để fetch dữ liệu sách
    const { data: booksData, isLoading } = useCustomQuery(
        ["books"],
        () => bookApi.getAllBooks(), // gọi hàm API
        { staleTime: 1000 * 60 * 5 }
    );

    // Xử lý dữ liệu nhận được
    const books = Array.isArray(booksData?.data)
        ? booksData.data
        : Array.isArray(booksData)
            ? booksData
            : [];

    const filteredBooks = books.filter((b) =>
        (b?.title || "").toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const topBooks = filteredBooks.slice(0, 4);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F8F8] text-[#1A1A1A] flex flex-col">
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-[#EDE9E3] to-[#F8F8F8] py-20">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-bold text-[#1A1A1A] mb-4"
                    >
                        Khám phá thế giới tri thức
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-gray-600 max-w-2xl mx-auto mb-8"
                    >
                        Mua, bán và khám phá hàng ngàn đầu sách độc đáo từ các nhà bán sách
                        trên khắp nơi.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <Button className="bg-[#4A6FA5] hover:bg-[#3B5B86] text-white text-lg px-8 py-3 rounded-full shadow-md">
                            Khám phá ngay
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Category Section */}
            <section className="max-w-6xl mx-auto px-6 py-12">
                <h2 className="text-2xl font-semibold mb-6">Danh mục nổi bật</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {["Văn học", "Kinh tế", "Công nghệ", "Thiếu nhi"].map((cat) => (
                        <motion.div
                            key={cat}
                            whileHover={{ scale: 1.03 }}
                            className="p-6 bg-white rounded-2xl shadow-sm text-center border border-gray-100 cursor-pointer hover:shadow-md"
                        >
                            {cat}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Bestseller Section */}
            <section className="bg-[#EDE9E3] py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl font-semibold mb-8 text-center">
                        Sách bán chạy
                    </h2>

                    {isLoading ? (
                        <div className="text-center text-gray-600">Đang tải...</div>
                    ) : topBooks.length === 0 ? (
                        <div className="text-center text-gray-500">
                            Không có sách phù hợp.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {topBooks.map((book) => (
                                <motion.div
                                    key={book.id || book._id}
                                    whileHover={{ scale: 1.03 }}
                                    className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer"
                                >
                                    <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4 overflow-hidden">
                                        <img
                                            src={
                                                book.coverImage && book.coverImage !== "string"
                                                    ? book.coverImage
                                                    : "https://via.placeholder.com/200x300?text=No+Image"
                                            }
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="font-medium truncate">{book.title}</h3>
                                    <p className="text-sm text-gray-500 truncate">
                                        {book.author}
                                    </p>
                                    {book.price !== undefined && (
                                        <p className="text-[#D97B48] font-semibold mt-2">
                                            {Number(book.price).toLocaleString("vi-VN")}đ
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
                <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
                    © 2025 BookNest. Mọi quyền được bảo lưu.
                </div>
            </footer>
        </div>
    );
}
