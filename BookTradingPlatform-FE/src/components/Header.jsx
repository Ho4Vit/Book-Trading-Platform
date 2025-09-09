import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="container">
                <h1 className="logo"><Link to="/">BookStore</Link></h1>
                <nav>
                    <ul className="nav">
                        <li><Link to="/">Trang chủ</Link></li>
                        <li><Link to="/login">Đăng nhập</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
