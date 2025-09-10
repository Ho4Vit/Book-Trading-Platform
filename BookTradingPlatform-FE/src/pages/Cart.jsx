import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const userId = auth?.userId;

    useEffect(() => { if (userId) fetchCart(); }, [userId]);

    const fetchCart = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/cart/get/${userId}`);
            if (res.data.statusCode === "SUC_200") setCart(res.data.data);
        } catch (err) { console.error(err); }
    };

    const updateQuantity = async (bookId, change) => {
        const currentItem = cart.cartItems.find(item => item.bookId === bookId);
        if (!currentItem) return;
        if (currentItem.quantity === 1 && change === -1) return removeItem(bookId);

        try {
            await axios.post("http://localhost:8080/api/v1/cart/add", {
                userId,
                cartItems: [{ bookId, quantity: change }],
            });
            fetchCart();
        } catch (err) { console.error(err); }
    };

    const removeItem = async (bookId) => {
        try {
            await axios.post("http://localhost:8080/api/v1/cart/remove", { userId, bookId });
            fetchCart();
        } catch (err) { console.error(err); }
    };

    const clearCart = async () => {
        try {
            await Promise.all(cart.cartItems.map(item =>
                axios.post("http://localhost:8080/api/v1/cart/remove", { userId, bookId: item.bookId })
            ));
            fetchCart();
        } catch (err) { console.error(err); }
    };

    const handleBuyItem = async (item) => {
        try {
            const res = await axios.post("http://localhost:8080/api/orders/create", {
                customerId: userId,
                items: [{ bookId: item.bookId, quantity: item.quantity }]
            });
            const orderId = res.data.data.id;
            navigate(`/checkout/${orderId}`);
        } catch (err) { console.error(err); alert("Tạo đơn hàng thất bại!"); }
    };

    const handleBuyAll = async () => {
        try {
            const items = cart.cartItems.map(item => ({ bookId: item.bookId, quantity: item.quantity }));
            const res = await axios.post("http://localhost:8080/api/orders/create", {
                customerId: userId,
                items
            });
            const orderId = res.data.data.id;
            navigate(`/checkout/${orderId}`);
        } catch (err) { console.error(err); alert("Có lỗi khi mua hàng!"); }
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
                        {cart.cartItems.map(item => (
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
                                    <div className="cart-actions">
                                        <button className="remove-btn" onClick={() => removeItem(item.bookId)}>Xóa</button>
                                        <button className="btn-buy-now" onClick={() => handleBuyItem(item)}>Mua ngay</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h3>Tổng tiền: {cart.totalPrice.toLocaleString()} đ</h3>
                    <div className="cart-footer-buttons">
                        <button className="clear-btn" onClick={clearCart}>Xóa toàn bộ giỏ hàng</button>
                        <button className="buy-all-btn" onClick={handleBuyAll}>Mua tất cả</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
