import React, { useState, useEffect, useRef } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { sellerApi } from "@/api/index.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { User, Mail, Phone, MapPin, Store, Edit, Save, X, Camera, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function SellerProfile() {
	const { userId } = useAuthStore();
	const [isEditing, setIsEditing] = useState(false);
	const [avatarPreview, setAvatarPreview] = useState(null);
	const fileInputRef = useRef(null);
	const [profileForm, setProfileForm] = useState({
        fullName: "",
		email: "",
        phone: "",
        storeAddress: "",
        storeName: "",
		storeDescription: "",
	});

	// Fetch seller data
	const { data: sellerData, isLoading } = useCustomQuery(
		["seller-profile", userId],
		() => sellerApi.getSellerById(userId),
		{
			enabled: !!userId,
		}
	);

	const seller = sellerData?.data || sellerData;

	// Update seller mutation
	const updateMutation = useCustomMutation(
		(data) => sellerApi.updateSeller(userId, data),
		"PUT",
		{
			invalidateKeys: ["seller-profile"],
			onSuccess: () => {
				toast.success("Cập nhật thông tin thành công!");
				setIsEditing(false);
			},
		}
	);

	// Update avatar mutation
	const updateAvatarMutation = useCustomMutation(
		(formData) => sellerApi.updateAvatar(userId, formData),
		"POST",
		{
			invalidateKeys: ["seller-profile"],
			onSuccess: () => {
				toast.success("Cập nhật ảnh đại diện thành công!");
				setAvatarPreview(null);
			},
		}
	);

	// Initialize form when data loads
	useEffect(() => {
		if (seller) {
			setProfileForm({
                fullName: seller.fullName || "",
				email: seller.email || "",
				phone: seller.phone || "",
                storeAddress: seller.storeAddress || "",
                storeName: seller.storeName || "",
                storeDescription: seller.storeDescription || "",
			});
		}
	}, [seller]);

	const handleSave = () => {
		updateMutation.mutate(profileForm);
	};

	const handleCancel = () => {
		if (seller) {
			setProfileForm({
                fullName: seller.fullName || "",
				email: seller.email || "",
				phone: seller.phone || "",
                storeAddress: seller.storeAddress || "",
				storeName: seller.storeName || "",
                storeDescription: seller.storeDescription || "",
			});
		}
		setIsEditing(false);
	};

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				toast.error("Vui lòng chọn file ảnh!");
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Kích thước ảnh không được vượt quá 5MB!");
				return;
			}

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatarPreview(reader.result);
			};
			reader.readAsDataURL(file);

			// Upload avatar
			const formData = new FormData();
			formData.append('file', file);
			updateAvatarMutation.mutate(formData);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">Hồ sơ của tôi</h1>
				<p className="text-muted-foreground">
					Quản lý thông tin cá nhân và cửa hàng của bạn
				</p>
			</div>

			{/* Profile Header Card */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-6">
						<div className="relative group">
							<Avatar className="h-24 w-24">
								<AvatarImage
									src={avatarPreview || seller?.profileImage}
									alt={seller?.fullName}
								/>
								<AvatarFallback className="text-2xl">
									{seller?.fullName?.charAt(0).toUpperCase() || "S"}
								</AvatarFallback>
							</Avatar>
							{/* Avatar Upload Button */}
							<Button
								size="icon"
								variant="secondary"
								className="absolute bottom-0 right-0 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
								onClick={handleAvatarClick}
								disabled={updateAvatarMutation.isPending}
							>
								{updateAvatarMutation.isPending ? (
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
								) : (
									<Camera className="h-4 w-4" />
								)}
							</Button>
							{/* Hidden File Input */}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleAvatarChange}
								className="hidden"
							/>
						</div>
						<div className="flex-1">
							<h2 className="text-2xl font-bold">
								{seller?.fullName || "Người bán"}
							</h2>
							<p className="text-muted-foreground">{seller?.email}</p>
							<Button
								variant="ghost"
								size="sm"
								className="mt-2 h-8 gap-2 text-xs"
								onClick={handleAvatarClick}
								disabled={updateAvatarMutation.isPending}
							>
								<Upload className="h-3 w-3" />
								{updateAvatarMutation.isPending ? "Đang tải lên..." : "Thay đổi ảnh đại diện"}
							</Button>
						</div>
						{!isEditing ? (
							<Button onClick={() => setIsEditing(true)} className="gap-2">
								<Edit className="h-4 w-4" />
								Chỉnh sửa
							</Button>
						) : (
							<div className="flex gap-2">
								<Button
									onClick={handleSave}
									disabled={updateMutation.isPending}
									className="gap-2"
								>
									<Save className="h-4 w-4" />
									{updateMutation.isPending ? "Đang lưu..." : "Lưu"}
								</Button>
								<Button
									variant="outline"
									onClick={handleCancel}
									className="gap-2"
								>
									<X className="h-4 w-4" />
									Hủy
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Personal Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Thông tin cá nhân
						</CardTitle>
						<CardDescription>
							Thông tin liên hệ và địa chỉ của bạn
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Họ và tên</Label>
							{isEditing ? (
								<Input
									id="name"
									value={profileForm.fullName}
									onChange={(e) =>
										setProfileForm({ ...profileForm, fullName: e.target.value })
									}
									placeholder="Nhập họ tên"
								/>
							) : (
								<div className="flex items-center gap-2 p-2">
									<User className="h-4 w-4 text-muted-foreground" />
									<span>{seller?.fullName || "Chưa cập nhật"}</span>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<div className="flex items-center gap-2 p-2">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<span>{seller?.email || "Chưa cập nhật"}</span>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Số điện thoại</Label>
							{isEditing ? (
								<Input
									id="phone"
									value={profileForm.phone}
									onChange={(e) =>
										setProfileForm({ ...profileForm, phone: e.target.value })
									}
									placeholder="Nhập số điện thoại"
								/>
							) : (
								<div className="flex items-center gap-2 p-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span>{seller?.phoneNumber || "Chưa cập nhật"}</span>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="storeAddress">Địa chỉ</Label>
							{isEditing ? (
								<Textarea
									id="storeAddress"
									value={profileForm.storeAddress}
									onChange={(e) =>
										setProfileForm({ ...profileForm, storeAddress: e.target.value })
									}
									placeholder="Nhập địa chỉ"
									rows={3}
								/>
							) : (
								<div className="flex items-start gap-2 p-2">
									<MapPin className="h-4 w-4 text-muted-foreground mt-1" />
									<span>{seller?.storeAddress || "Chưa cập nhật"}</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Shop Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Store className="h-5 w-5" />
							Thông tin cửa hàng
						</CardTitle>
						<CardDescription>
							Thông tin về cửa hàng của bạn
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="storeName">Tên cửa hàng</Label>
							{isEditing ? (
								<Input
									id="storeName"
									value={profileForm.storeName}
									onChange={(e) =>
										setProfileForm({ ...profileForm, storeName: e.target.value })
									}
									placeholder="Nhập tên cửa hàng"
								/>
							) : (
								<div className="flex items-center gap-2 p-2">
									<Store className="h-4 w-4 text-muted-foreground" />
									<span>{seller?.storeName || "Chưa cập nhật"}</span>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="storeDescription">Mô tả cửa hàng</Label>
							{isEditing ? (
								<Textarea
									id="storeDescription"
									value={profileForm.storeDescription}
									onChange={(e) =>
										setProfileForm({
											...profileForm,
                                            storeDescription: e.target.value,
										})
									}
									placeholder="Mô tả về cửa hàng của bạn"
									rows={6}
								/>
							) : (
								<div className="p-2 min-h-[120px]">
									<p className="text-sm">
										{seller?.storeDescription || "Chưa có mô tả"}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
