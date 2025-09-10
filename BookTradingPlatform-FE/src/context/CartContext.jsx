import React, { createContext, useState } from "react";
import axios from "axios";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    const fetchCart = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/cart/get/${userId}`);
            if (res.data?.data?.cartItems) {
                const totalItems = res.data.data.cartItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                );
                setCartCount(totalItems);
            }
        } catch (err) {
            console.error("Lỗi khi lấy giỏ hàng:", err);
        }
    };

    // Hàm xóa cart context
    const clearCartContext = () => {
        setCartCount(0);
    };

    return (
        <CartContext.Provider value={{ cartCount, setCartCount, fetchCart, clearCartContext }}>
            {children}
        </CartContext.Provider>
    );
};
