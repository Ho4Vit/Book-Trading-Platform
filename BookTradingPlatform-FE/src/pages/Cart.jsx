import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Cart.css";

function Cart() {
    const { auth } = useContext(AuthContext);
    const [cart, setCart] = useState(null);
    const userId = auth?.userId;

    useEffect(() => {
        if (userId) fetchCart();
    }, [userId]);

    // Lấy giỏ hàng
    const fetchCart = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/cart/get/${userId}`);
            if (res.data.statusCode === "SUC_200") setCart(res.data.data);
        } catch (err) {
            console.error("Lỗi khi lấy giỏ hàng:", err);
        }
    };

    // Cập nhật số lượng
    const updateQuantity = async (bookId, change) => {
        const currentItem = cart.cartItems.find((item) => item.bookId === bookId);
        if (!currentItem) return;

        if (currentItem.quantity === 1 && change === -1) return removeItem(bookId);

        try {
            const res = await axios.post("http://localhost:8080/api/v1/cart/add", {
                userId,
                cartItems: [{ bookId, quantity: change }],
            });
            if (res.data.statusCode === "SUC_200") fetchCart();
        } catch (err) {
            console.error("Lỗi khi cập nhật giỏ hàng:", err);
        }
    };

    // Xóa 1 sản phẩm
    const removeItem = async (bookId) => {
        try {
            const res = await axios.post("http://localhost:8080/api/v1/cart/remove", {
                userId,
                bookId
            });
            if (res.data.statusCode === "SUC_200") fetchCart();
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm:", err);
        }
    };

    // Xóa toàn bộ giỏ hàng
    const clearCart = async () => {
        try {
            await Promise.all(
                cart.cartItems.map((item) =>
                    axios.post("http://localhost:8080/api/v1/cart/remove", {
                        userId,
                        bookId: item.bookId
                    })
                )
            );
            fetchCart();
        } catch (err) {
            console.error("Lỗi khi xóa toàn bộ giỏ hàng:", err);
        }
    };

    if (!cart) return <div>Đang tải giỏ hàng...</div>;

    return (
        <div className="cart-container">
            <h2>🛒 Giỏ hàng của bạn</h2>
            {cart.cartItems.length === 0 ? (
                <p>Giỏ hàng trống.</p>
            ) : (
                <>
                    <ul className="cart-list">
                        {cart.cartItems.map((item) => (
                            <li key={item.bookId} className="cart-item">
                                <img src={item.imgUrl} alt={item.bookName} className="cart-img" />
                                <div className="cart-info">
                                    <h4>{item.bookName}</h4>
                                    <p>Người bán: {item.sellerName}</p>
                                    <p>Giá: {item.price?.toLocaleString()} đ</p>
                                    <div className="cart-quantity">
                                        <button onClick={() => updateQuantity(item.bookId, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.bookId, 1)}>+</button>
                                    </div>
                                    <p>Thành tiền: {(item.price * item.quantity).toLocaleString()} đ</p>
                                    <button className="remove-btn" onClick={() => removeItem(item.bookId)}>Xóa</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h3>Tổng tiền: {cart.totalPrice.toLocaleString()} đ</h3>
                    <button className="clear-btn" onClick={clearCart}>Xóa toàn bộ giỏ hàng</button>
                </>
            )}
        </div>
    );
}

export default Cart;
