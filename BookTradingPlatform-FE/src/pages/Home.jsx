import React, { useEffect, useState } from "react";
import axios from "axios";
import BookSlider from "../components/BookSlider";
import "./Home.css";

function Home() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/v1/books/all")
            .then((res) => {
                setBooks(res.data.data || []); // lấy mảng "data"
            })
            .catch((err) => console.error("Lỗi khi fetch books:", err));
    }, []);

    return (
        <div className="home">
            {/* Banner */}
            <div className="banner">
                <img
                    src="https://via.placeholder.com/1200x300?text=Book+Store+Banner"
                    alt="Banner"
                />
            </div>

            {/* Slider */}
            <h2>Sách mới ra mắt</h2>
            <BookSlider books={books} />

            {/* List Book Cards */}
            <h2>Tất cả sách</h2>
            <div className="book-list">
                {books.map((book) => (
                    <div key={book.id} className="book-item">
                        <img src={book.coverImage} alt={book.title} />
                        <h3>{book.title}</h3>
                        <p>Tác giả: {book.author}</p>
                        <p>Giá: {book.price.toLocaleString()} đ</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
