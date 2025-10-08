import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBookById } from "@/services/bookService";

// 👉 Nhớ import font trong index.html hoặc main.jsx:
// <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

const BookDetailPage = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const data = await getBookById(id);
                setBook(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-gray-500 text-lg font-['Noto_Sans']">
                Đang tải thông tin sách...
            </div>
        );

    if (!book)
        return (
            <div className="flex justify-center items-center h-screen text-red-500 text-lg font-['Noto_Sans']">
                Không tìm thấy sách!
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 bg-white font-['Noto_Sans']">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* ==== CỘT TRÁI: ẢNH SÁCH ==== */}
                <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl shadow-sm p-4 flex justify-center">
                        <img
                            src={book.coverImage}
                            alt={book.title}
                            className="object-contain w-[350px] h-[480px] rounded-xl"
                        />
                    </div>

                    {/* Ảnh phụ */}
                    {book.additionalImages?.length > 0 && (
                        <div className="flex gap-3 mt-4 justify-center">
                            {book.additionalImages.slice(0, 3).map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`thumb-${i}`}
                                    onClick={() => setBook({ ...book, coverImage: img })}
                                    className={`w-20 h-24 object-cover rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                                        book.coverImage === img
                                            ? "border-blue-500"
                                            : "border-gray-300 hover:border-blue-400"
                                    }`}
                                />
                            ))}

                            {book.additionalImages.length > 3 && (
                                <div
                                    className="w-20 h-24 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-medium text-sm cursor-pointer hover:bg-gray-200 transition"
                                    onClick={() =>
                                        alert(`Còn ${book.additionalImages.length - 3} ảnh khác`)
                                    }
                                >
                                    +{book.additionalImages.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ==== CỘT PHẢI: THÔNG TIN ==== */}
                <div className="flex-[2]">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-snug">
                        {book.title}
                    </h1>

                    {/* Rating + Đã bán */}
                    <div className="flex items-center mb-4 text-sm text-gray-600">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                fill={i < 4 ? "gold" : "none"}
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5 text-yellow-500"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.48 3.499a.562.562 0 011.04 0l2.25 4.553a.563.563 0 00.424.308l5.023.73a.562.562 0 01.311.959l-3.63 3.537a.562.562 0 00-.162.498l.857 4.995a.562.562 0 01-.815.592l-4.49-2.36a.563.563 0 00-.524 0l-4.49 2.36a.562.562 0 01-.815-.592l.857-4.995a.562.562 0 00-.162-.498l-3.63-3.537a.562.562 0 01.311-.959l5.023-.73a.563.563 0 00.424-.308l2.25-4.553z"
                                />
                            </svg>
                        ))}
                        <span className="ml-2 text-gray-700 font-medium">
              4.5/5 ({120} đánh giá)
            </span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className="text-gray-700 font-medium">
              Đã bán: {book.soldCount}
            </span>
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="text-gray-600 text-sm space-y-1 mb-6">
                        <p>
                            <span className="font-medium text-gray-800">Tác giả:</span>{" "}
                            {book.author}
                        </p>
                        <p>
                            <span className="font-medium text-gray-800">Ngôn ngữ:</span>{" "}
                            {book.language}
                        </p>
                        <p>
                            <span className="font-medium text-gray-800">Định dạng:</span>{" "}
                            {book.format}
                        </p>
                        <p>
                            <span className="font-medium text-gray-800">Số trang:</span>{" "}
                            {book.pageCount}
                        </p>
                        <p>
                            <span className="font-medium text-gray-800">Thể loại:</span>{" "}
                            {book.categoryNames?.map((cat, idx) => (
                                <span
                                    key={idx}
                                    className="bg-blue-50 border border-blue-200 text-blue-600 text-xs font-medium px-2 py-1 rounded-full mr-1"
                                >
                  {cat}
                </span>
                            ))}
                        </p>
                    </div>

                    {/* Giá + hành động */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
                        <p className="text-5xl font-extrabold text-red-600 mb-3 tracking-tight">
                            {book.price.toLocaleString()}₫
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <button
                                disabled={!book.active}
                                className={`px-6 py-3 rounded-xl text-white font-semibold transition-all shadow-md ${
                                    book.active
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-gray-400 cursor-not-allowed"
                                }`}
                            >
                                🛒 Thêm vào giỏ hàng
                            </button>

                            <button className="px-6 py-3 rounded-xl border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white font-semibold transition-all shadow-md">
                                ❤️ Thêm vào yêu thích
                            </button>
                        </div>
                    </div>

                    {/* Chính sách */}
                    <div className="border-t pt-4 text-gray-700 space-y-2 text-sm">
                        <p>🚚 Giao hàng toàn quốc (2-5 ngày)</p>
                        <p>💳 Thanh toán khi nhận hàng hoặc qua ví điện tử</p>
                        <p>🔁 Đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất</p>
                    </div>
                </div>
            </div>

            {/* ==== MÔ TẢ ==== */}
            <div className="mt-12 bg-gray-50 p-8 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                    📖 Mô tả sản phẩm
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {book.description || "Không có mô tả cho cuốn sách này."}
                </p>
            </div>
        </div>
    );
};

export default BookDetailPage;
