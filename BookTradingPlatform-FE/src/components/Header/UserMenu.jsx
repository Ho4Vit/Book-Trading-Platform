import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import axios from "axios";

const UserMenu = () => {
    const { auth, logout } = useContext(AuthContext);
    const { clearCartContext } = useContext(CartContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        clearCartContext();
        navigate("/login");
    };

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    useEffect(() => {
        if (auth?.userId && auth?.role) {
            let url = "";
            const role = auth.role.replace("ROLE_", "").toUpperCase();

            if (role === "CUSTOMER") {
                url = `http://localhost:8080/api/v1/customers/getbyid/${auth.userId}`;
            } else if (role === "SELLER") {
                url = `http://localhost:8080/api/v1/sellers/getbyid/${auth.userId}`;
            } else if (role === "ADMIN") {
                url = `http://localhost:8080/api/v1/admins/getbyid/${auth.userId}`;
            }

            if (url) {
                axios.get(url, { headers: { Authorization: `Bearer ${auth.token}` } })
                    .then((res) => {
                        if (res.data.statusCode === "SUC_200") {
                            setProfile(res.data.data);
                        }
                    })
                    .catch((err) => console.error("Lỗi lấy profile:", err));
            }
        }
    }, [auth]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="user-menu" ref={dropdownRef}>
            {auth && profile ? (
                <>
                    <div className="user-info" onClick={toggleDropdown}>
                        {profile.profileImage ? (
                            <img src={profile.profileImage} alt="Avatar" className="avatar" />
                        ) : (
                            <i className="fas fa-user"></i>
                        )}
                        <span>{profile.fullName || profile.storeName || "Tài khoản"}</span>
                    </div>

                    {dropdownOpen && (
                        <div className="dropdown-menu">
                            <button onClick={() => { navigate("/profile"); setDropdownOpen(false); }}>
                                <i className="fas fa-user-circle"></i>
                                <span>Xem profile</span>
                            </button>

                            {auth.role.includes("SELLER") && (
                                <button onClick={() => { navigate("/seller/books"); setDropdownOpen(false); }}>
                                    <i className="fas fa-books"></i>
                                    <span>Quản lý sách</span>
                                </button>
                            )}

                            <button onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <button onClick={() => navigate("/login")}>
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Đăng nhập</span>
                </button>
            )}
        </div>
    );
};

export default UserMenu;
