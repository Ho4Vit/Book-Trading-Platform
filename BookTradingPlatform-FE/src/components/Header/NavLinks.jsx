import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";

const NavLinks = () => {
    const navigate = useNavigate();
    const { cartCount } = useContext(CartContext);

    return (
        <>
            <button onClick={() => navigate("/")}>
                <i className="fas fa-home"></i>
                <span>Trang chủ</span>
            </button>

            <button onClick={() => navigate("/books")}>
                <i className="fas fa-book"></i>
                <span>Sách</span>
            </button>

            <button className="cart-link" onClick={() => navigate("/cart")}>
                <i className="fas fa-shopping-cart"></i>
                <span>Giỏ hàng</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
        </>
    );
};

export default NavLinks;
