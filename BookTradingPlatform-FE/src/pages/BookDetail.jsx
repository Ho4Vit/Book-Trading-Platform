import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "./BookDetail.css";

function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const { auth } = useContext(AuthContext);
    const { fetchCart } = useContext(CartContext);

    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/v1/books/${id}`)
            .then((res) => {
                setBook(res.data.data);
                setMainImage(res.data.data.coverImage);
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
                cartItems: [{ bookId: book.id, quantity: 1 }],
            });
            fetchCart(auth.userId);
            alert("Đã thêm vào giỏ hàng!");
        } catch (err) {
            console.error(err);
        }
    };

    const handleBuyNow = async () => {
        if (!auth) {
            alert("Bạn cần đăng nhập để mua hàng!");
            return;
        }
        try {
            const res = await axios.post("http://localhost:8080/api/orders/create", {
                customerId: auth.userId,
                items: [{ bookId: book.id, quantity: 1 }],
            });
            const orderId = res.data.data.id;
            navigate(`/checkout/${orderId}`);
        } catch (err) {
            console.error(err);
            alert("Tạo đơn hàng thất bại!");
        }
    };

    if (!book) return <p>Loading...</p>;

    return (
        <div className="book-detail-container">
            {/* Cột trái - ảnh */}
            <div className="book-detail-left">
                <div className="main-image">
                    <img src={mainImage} alt={book.title} />
                </div>
                <div className="thumbnail-list">
                    {[book.coverImage, ...(book.additionalImages || [])].map(
                        (img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`thumb-${idx}`}
                                onClick={() => setMainImage(img)}
                                className={mainImage === img ? "active" : ""}
                            />
                        )
                    )}
                </div>
            </div>

            {/* Cột phải - thông tin */}
            <div className="book-detail-right">
                <h2 className="book-title">{book.title}</h2>
                <p className="book-sold">Đã bán {book.soldCount}</p>

                <div className="book-info-box">
                    <p><strong>Tác giả:</strong> {book.author}</p>
                    <p><strong>Ngôn ngữ:</strong> {book.language}</p>
                    <p><strong>Số trang:</strong> {book.pageCount}</p>
                    <p><strong>Loại bìa:</strong> {book.format}</p>
                </div>


                <div className="category-tags">
                    {book.categoryNames.map((cat, idx) => (
                        <span key={idx} className="tag">{cat}</span>
                    ))}
                </div>
                <div className="price-box">
                    <span className="book-price">{book.price.toLocaleString()} đ</span>
                </div>
                <div className="action-buttons">
                    <button className="buy-now" onClick={handleBuyNow}>Mua ngay</button>
                    <button className="add-to-cart" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
                </div>


            </div>
        </div>
    );
}

export default BookDetail;
