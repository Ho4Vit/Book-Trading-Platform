import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPage.css";

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách user (ví dụ API cho admin)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/v1/admin/users");
            setUsers(res.data.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách user:", err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>
            <p>Chào mừng bạn đến trang quản trị.</p>

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.length > 0 ? (
                        users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.fullName || u.username}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">Không có dữ liệu.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminPage;
