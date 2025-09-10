// src/pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "./Profile.css";

function Profile() {
    const { auth } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // Form info
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
    });

    // Avatar upload
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Lấy profile ban đầu
    useEffect(() => {
        if (auth?.userId) {
            axios
                .get(`http://localhost:8080/api/v1/customers/getbyid/${auth.userId}`)
                .then((res) => {
                    if (res.data.statusCode === "SUC_200") {
                        setProfile(res.data.data);
                        setFormData({
                            fullName: res.data.data.fullName,
                            phone: res.data.data.phone,
                            address: res.data.data.address,
                            dateOfBirth: res.data.data.dateOfBirth,
                            gender: res.data.data.gender,
                        });
                    }
                })
                .catch((err) => console.error(err));
        }
    }, [auth]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle avatar file change + preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setAvatarFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(null);
        }
    };

    // Handle submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Upload avatar nếu có
            if (avatarFile) {
                const data = new FormData();
                data.append("file", avatarFile);
                await axios.post(
                    `http://localhost:8080/api/v1/sellers/avartat/${auth.userId}`,
                    data,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                setAvatarFile(null);
                setAvatarPreview(null);
            }

            // 2. Cập nhật thông tin profile
            const res = await axios.post(
                `http://localhost:8080/api/v1/customers/update/${auth.userId}`,
                formData
            );

            if (res.data.statusCode === "SUC_200") {
                // 3. Lấy lại thông tin user mới nhất
                const profileRes = await axios.get(
                    `http://localhost:8080/api/v1/customers/getbyid/${auth.userId}`
                );
                if (profileRes.data.statusCode === "SUC_200") {
                    setProfile(profileRes.data.data);
                }
                setEditMode(false);
                alert("Cập nhật thông tin thành công!");
            }
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi cập nhật!");
        }
    };

    if (!profile) return <div>Đang tải thông tin...</div>;

    return (
        <div className="profile-container">
            <h1>Thông tin cá nhân</h1>
            <div className="profile-card">
                <img
                    src={avatarPreview || profile.profileImage || "/default-avatar.png"}
                    alt="Avatar"
                    className="profile-avatar"
                />

                {!editMode ? (
                    <>
                        <p><strong>Họ tên:</strong> {profile.fullName}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Số điện thoại:</strong> {profile.phone}</p>
                        <p><strong>Địa chỉ:</strong> {profile.address}</p>
                        <p><strong>Ngày sinh:</strong> {profile.dateOfBirth}</p>
                        <p><strong>Giới tính:</strong> {profile.gender}</p>
                        <button onClick={() => setEditMode(true)}>Chỉnh sửa profile</button>
                    </>
                ) : (
                    <form className="profile-form" onSubmit={handleSubmit}>
                        <label>
                            Ảnh đại diện:
                            <input type="file" onChange={handleFileChange} />
                        </label>

                        <label>
                            Họ tên:
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
                        </label>
                        <label>
                            Số điện thoại:
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                        </label>
                        <label>
                            Địa chỉ:
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </label>
                        <label>
                            Ngày sinh:
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                        </label>
                        <label>
                            Giới tính:
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                            </select>
                        </label>

                        <div className="profile-form-buttons">
                            <button type="submit">Lưu thay đổi</button>
                            <button type="button" onClick={() => setEditMode(false)}>Hủy</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Profile;
