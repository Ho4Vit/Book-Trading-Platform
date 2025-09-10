import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./BookDetail.css";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

function BookDetail() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const { auth } = useContext(AuthContext);
    const { fetchCart } = useContext(CartContext);

    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/v1/books/${id}`)
            .then((res) => {
                setBook(res.data.data);
            })
            .catch((err) => console.error(err));
    }, [id]);

    const handleAddToCart = async () => {
        if (!auth) {
            alert("Bạn cần đăng nhập để thêm vào giỏ hàng!");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/v1/cart/add", {
                userId: auth.userId,
                cartItems: [
                    {
                        bookId: book.id,
                        quantity: 1, // luôn +1 khi thêm
                    },
                ],
            });
            // gọi lại cart để cập nhật badge
            fetchCart(auth.userId);
            alert("Đã thêm vào giỏ hàng!");
        } catch (err) {
            console.error("Lỗi khi thêm giỏ hàng:", err);
        }
    };

    if (!book) return <p>Loading...</p>;

    return (
        <div className="book-detail">
            <div className="images">
                <img className="main-img" src={book.coverImage} alt={book.title} />
                <div className="additional">
                    {book.additionalImages.map((img, idx) => (
                        <img key={idx} src={img} alt={`extra-${idx}`} />
                    ))}
                </div>
            </div>
            <div className="info">
                <h2>{book.title}</h2>
                <p><b>Tác giả:</b> {book.author}</p>
                <p><b>Ngôn ngữ:</b> {book.language}</p>
                <p><b>Số trang:</b> {book.pageCount}</p>
                <p className="price">{book.price.toLocaleString()} đ</p>

                <div className="actions">
                    <button className="btn-buy">Mua ngay</button>
                    <button className="btn-add" onClick={handleAddToCart}>
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BookDetail;
