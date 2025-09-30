import React from "react";
import "./Header.css";
import Logo from "./header/Logo.jsx";
import SearchBar from "./header/SearchBar.jsx";
import NavLinks from "./header/NavLinks.jsx";
import UserMenu from "./header/UserMenu.jsx";

function Header() {
    return (
        <header className="header">
            <Logo />
            <SearchBar />
            <nav className="nav">
                <NavLinks />
                <UserMenu />
            </nav>
        </header>
    );
}

export default Header;
