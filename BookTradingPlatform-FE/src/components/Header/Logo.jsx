import React from "react";
import { useNavigate } from "react-router-dom";

const Logo = () => {
    const navigate = useNavigate();
    return (
        <div className="logo" onClick={() => navigate("/")}>
            <i className="fas fa-book-open"></i>
            <span>BookStore</span>
        </div>
    );
};

export default Logo;
