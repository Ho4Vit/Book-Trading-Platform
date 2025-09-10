import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SellerBookPage.css";

const baseURL = "http://localhost:8080/api/v1/books";

function SellerBookPage() {
    const [activeMenu, setActiveMenu] = useState("list"); // list | add | edit
    const [books, setBooks] = useState([]);
    const [bookId, setBookId] = useState("");
    const [book, setBook] = useState(null); // loaded book for edit / details
    const [selectedBook, setSelectedBook] = useState(null); // for modal

    const [form, setForm] = useState({
        title: "",
        description: "",
        author: "",
        language: "",
        pageCount: 0,
        price: 0,
        stock: 0,
        sellerId: 1,
        seriesId: null,
        format: "HARDCOVER",
        categoryIds: []
    });

    const [coverImage, setCoverImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([null, null, null]); // 3 slot cố định

    // load danh sách sách
    const fetchAllBooks = async () => {
        try {
            const res = await axios.get(`${baseURL}/all`);
            setBooks(res.data.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách sách:", err);
            setBooks([]);
        }
    };

    useEffect(() => {
        fetchAllBooks();
    }, []);

    // Lấy sách theo id (dùng cho edit hoặc khi user bấm tìm)
    const handleFetchBook = async (idParam) => {
        const id = idParam || bookId;
        if (!id) return;
        try {
            const res = await axios.get(`${baseURL}/${id}`);
            const data = res.data.data;
            setBook(data);
            setForm((prev) => ({
                ...prev,
                title: data.title || "",
                description: data.description || "",
                author: data.author || "",
                language: data.language || "",
                pageCount: data.pageCount || 0,
                price: data.price || 0,
                stock: data.stock || 0,
                sellerId: data.sellerId || prev.sellerId,
                seriesId: data.seriesId || null,
                format: data.format || "HARDCOVER",
                categoryIds: data.categoryNames ? [] : []
            }));
            setCoverImage(null);
            setAdditionalImages([null, null, null]);
        } catch (err) {
            console.error("Lỗi lấy sách:", err);
            alert("Không tìm thấy sách hoặc lỗi server.");
        }
    };

    // Tạo sách mới
    const handleCreateBook = async () => {
        try {
            const res = await axios.post(`${baseURL}/create`, form);
            const newBook = res.data.data;
            if (newBook && (coverImage || additionalImages.some((img) => img))) {
                const formData = new FormData();
                if (coverImage) formData.append("coverImage", coverImage);
                additionalImages.forEach((f) => {
                    if (f) formData.append("additionalImages", f);
                });
                await axios.post(`${baseURL}/image/${newBook.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }
            alert("Tạo sách thành công!");
            setForm({
                title: "",
                description: "",
                author: "",
                language: "",
                pageCount: 0,
                price: 0,
                stock: 0,
                sellerId: form.sellerId,
                seriesId: null,
                format: "HARDCOVER",
                categoryIds: []
            });
            setCoverImage(null);
            setAdditionalImages([null, null, null]);
            fetchAllBooks();
            setActiveMenu("list");
        } catch (err) {
            console.error(err);
            alert("Tạo sách thất bại");
        }
    };

    // Cập nhật thông tin sách
    const handleUpdateBook = async () => {
        if (!bookId) {
            alert("Vui lòng nhập Book ID hoặc chọn một sách để chỉnh sửa.");
            return;
        }
        try {
            await axios.put(`${baseURL}/${bookId}`, form);
            if (coverImage || additionalImages.some((img) => img)) {
                const formData = new FormData();
                if (coverImage) formData.append("coverImage", coverImage);
                additionalImages.forEach((f) => {
                    if (f) formData.append("additionalImages", f);
                });
                await axios.post(`${baseURL}/image/${bookId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }
            alert("Cập nhật sách thành công!");
            fetchAllBooks();
            setActiveMenu("list");
        } catch (err) {
            console.error(err);
            alert("Cập nhật thất bại");
        }
    };

    const openDetails = (b) => setSelectedBook(b);
    const closeDetails = () => setSelectedBook(null);

    const openEditFromDetails = async (b) => {
        closeDetails();
        setActiveMenu("edit");
        setBookId(b.id);
        await handleFetchBook(b.id);
    };

    return (
        <div className="seller-dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <h3>Seller Panel</h3>
                <ul>
                    <li className={activeMenu === "list" ? "active" : ""} onClick={() => setActiveMenu("list")}>
                        📚 Danh sách sách
                    </li>
                    <li className={activeMenu === "add" ? "active" : ""} onClick={() => setActiveMenu("add")}>
                        ➕ Thêm sách mới
                    </li>
                    <li className={activeMenu === "edit" ? "active" : ""} onClick={() => setActiveMenu("edit")}>
                        ✏️ Chỉnh sửa sách
                    </li>
                </ul>
            </div>

            {/* Content */}
            <div className="content">
                {/* LIST */}
                {activeMenu === "list" && (
                    <div className="section">
                        <h2>Danh sách sách</h2>
                        <div className="book-grid">
                            {books.length === 0 ? (
                                <p>Không có sách.</p>
                            ) : (
                                books.map((b) => (
                                    <div key={b.id} className="book-card">
                                        <div className="thumb">
                                            <img src={b.coverImage || "/default-book.png"} alt={b.title} onError={(e) => (e.target.src = "/default-book.png")} />
                                        </div>
                                        <div className="meta">
                                            <h4 className="title">{b.title}</h4>
                                            <p className="category">{(b.categoryNames && b.categoryNames.join(", ")) || "—"}</p>
                                            <div className="card-actions">
                                                <button onClick={() => openDetails(b)}>Xem chi tiết</button>
                                                <button onClick={() => { setActiveMenu("edit"); setBookId(b.id); handleFetchBook(b.id); }}>
                                                    Chỉnh sửa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ADD */}
                {activeMenu === "add" && (
                    <div className="section">
                        <h2>Thêm sách mới</h2>
                        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                        <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                        <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>

                        <label>Cover Image:</label>
                        <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} />

                        <label>Additional Image 1:</label>
                        <input type="file" onChange={(e) => setAdditionalImages((prev) => { const arr = [...prev]; arr[0] = e.target.files[0]; return arr; })} />

                        <label>Additional Image 2:</label>
                        <input type="file" onChange={(e) => setAdditionalImages((prev) => { const arr = [...prev]; arr[1] = e.target.files[0]; return arr; })} />

                        <label>Additional Image 3:</label>
                        <input type="file" onChange={(e) => setAdditionalImages((prev) => { const arr = [...prev]; arr[2] = e.target.files[0]; return arr; })} />

                        <button onClick={handleCreateBook}>Tạo sách</button>
                    </div>
                )}

                {/* EDIT */}
                {activeMenu === "edit" && (
                    <div className="section">
                        <h2>Chỉnh sửa sách</h2>
                        <div className="inline-row">
                            <input placeholder="Book ID" value={bookId} onChange={(e) => setBookId(e.target.value)} />
                            <button onClick={() => handleFetchBook()}>Tìm sách</button>
                        </div>
                        {book ? (
                            <>
                                <h3>Thông tin hiện tại</h3>
                                <p><strong>ID:</strong> {book.id}</p>
                                <p><strong>Title:</strong> {book.title}</p>
                                <p><strong>Price:</strong> {book.price}</p>
                                <p><strong>Stock:</strong> {book.stock}</p>
                                {book.coverImage && <img src={book.coverImage} alt="cover" width={120} />}

                                <h4>Cập nhật</h4>
                                <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                                <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                                <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                                <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                                <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>

                                <label>Cover Image (thay mới):</label>
                                <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} />

                                <label>Additional Image 1:</label>
                                <input type="file" onChange={(e) => setAdditionalImages((prev) => { const arr = [...prev]; arr[0] = e.target.files[0]; return arr; })} />

                                <label>Additional Image 2:</label>
                                <input type="file" onChange={(e) => setAdditionalImages((prev) => { const arr = [...prev]; arr[1] = e.target.files[0]; return arr; })} />

                                <label>Additional Image 3:</label>
                                <input type="file" onChange={(e) => setAdditionalImages((prev) => { const arr = [...prev]; arr[2] = e.target.files[0]; return arr; })} />

                                <div style={{ marginTop: 10 }}>
                                    <button onClick={handleUpdateBook}>Lưu thay đổi</button>
                                </div>
                            </>
                        ) : (
                            <p>Chưa có sách được chọn. Nhập ID và bấm "Tìm sách" hoặc mở "Xem chi tiết".</p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal chi tiết */}
            {selectedBook && (
                <div className="modal-overlay" onClick={closeDetails}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeDetails}>×</button>
                        <h2>{selectedBook.title}</h2>
                        <p><strong>ID:</strong> {selectedBook.id}</p>
                        <p><strong>Tác giả:</strong> {selectedBook.author}</p>
                        <p><strong>Giá:</strong> {selectedBook.price?.toLocaleString()} đ</p>
                        <p><strong>Kho:</strong> {selectedBook.stock}</p>
                        <p><strong>Thể loại:</strong> {(selectedBook.categoryNames && selectedBook.categoryNames.join(", ")) || "—"}</p>
                        <p><strong>Mô tả:</strong> {selectedBook.description}</p>
                        <div className="modal-images">
                            {selectedBook.coverImage && <img src={selectedBook.coverImage} alt="cover" />}
                            {selectedBook.additionalImages && selectedBook.additionalImages.map((img, i) => (
                                <img key={i} src={img} alt={`extra-${i}`} />
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => openEditFromDetails(selectedBook)}>Chỉnh sửa</button>
                            <button onClick={closeDetails}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SellerBookPage;
