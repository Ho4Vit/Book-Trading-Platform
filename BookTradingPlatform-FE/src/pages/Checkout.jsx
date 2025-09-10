import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Checkout.css";

function Checkout() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [order, setOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("COD");

    // Lấy chi tiết đơn hàng
    useEffect(() => {
        axios.get(`http://localhost:8080/api/orders/getbyid/${orderId}`)
            .then(res => setOrder(res.data.data))
            .catch(err => console.error(err));
    }, [orderId]);

    const handlePayment = async () => {
        if (!order) return;
        try {
            await axios.post(`http://localhost:8080/api/payments/create`, {
                orderId: order.id,
                amount: order.totalPrice,
                method: paymentMethod,
                status: "PENDING"
            });
            alert("Tạo yêu cầu thanh toán thành công!");
            navigate("/"); // tạm thời về trang Home
        } catch (err) {
            console.error(err);
            alert("Tạo thanh toán thất bại!");
        }
    };

    if (!order) return <p>Đang tải đơn hàng...</p>;

    return (
        <div className="checkout-container">
            <h2>Thanh toán đơn hàng </h2>

            <div className="order-items">
                {order.cartItems && order.cartItems.map(item => (
                    <div key={item.bookId} className="order-item">
                        <img src={item.imgUrl} alt={item.bookName} />
                        <div className="item-info">
                            <h4>{item.bookName}</h4>
                            <p>Người bán: {item.sellerName}</p>
                            <p>Số lượng: {item.quantity}</p>
                            <p>Giá: {item.price.toLocaleString()} đ</p>
                            <p>Thành tiền: {(item.price * item.quantity).toLocaleString()} đ</p>
                        </div>
                    </div>
                ))}
            </div>

            <h3>Tổng tiền: {order.totalPrice.toLocaleString()} đ</h3>

            <div className="payment-section">
                <label>Chọn phương thức thanh toán:</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <option value="COD">COD</option>
                    <option value="VNPAY">VNPAY</option>
                    <option value="MOMO">MOMO</option>
                    <option value="ZALOPAY">ZALOPAY</option>
                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                    <option value="PAYPAL">PayPal</option>
                </select>
                <button className="pay-btn" onClick={handlePayment}>Thanh toán</button>
            </div>
        </div>
    );
}

export default Checkout;
