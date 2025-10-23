import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";
import useCustomMutation from "@/hooks/useCustomMutation";
import toast from "react-hot-toast";
import {
	LogIn,
	Mail,
	Lock,
	KeyRound,
	Eye,
	EyeOff,
} from "lucide-react";

const LoginModal = ({ onClose }) => {
	const navigate = useNavigate();
	const { login } = useAuthStore();

	// Login state
	const [loginData, setLoginData] = useState({
		username: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);

	// Forgot password state
	const [forgotStep, setForgotStep] = useState(1);
	const [forgotEmail, setForgotEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);

	// Login mutation
	const loginMutation = useCustomMutation(
		(data) => authApi.login(data),
		"POST",
		{
			onSuccess: (res) => {
                const respone = res.data || res;
				if (respone?.token) {
					login({
						token: respone.token,
						role: respone.role,
						userId: respone.userId,
					});
					toast.success("Đăng nhập thành công 🎉");

					switch (respone.role) {
						case "CUSTOMER":
							navigate("/");
							break;
						case "SELLER":
							navigate("/seller");
							break;
						case "ADMIN":
							navigate("/admin");
							break;
						default:
							navigate("/");
					}
					onClose();
				} else {
					toast.error("Đăng nhập thất bại");
				}
			},
		}
	);

	// Send OTP mutation
	const sendOtpMutation = useCustomMutation(
		(data) => authApi.otpLogin(data),
		"POST",
		{
			onSuccess: () => {
				toast.success("Mã OTP đã được gửi đến email của bạn!");
				setForgotStep(2);
			},
		}
	);

	// Forgot password mutation
	const forgotPasswordMutation = useCustomMutation(
		(data) => authApi.forgotPassword(data),
		"POST",
		{
			onSuccess: () => {
				toast.success("Đặt lại mật khẩu thành công!");
				resetForgotPassword();
				document.querySelector('[value="login"]')?.click();
			},
		}
	);

	const handleLoginSubmit = (e) => {
		e.preventDefault();
		if (!loginData.username || !loginData.password) {
			toast.error("Vui lòng điền đầy đủ thông tin");
			return;
		}
		loginMutation.mutate(loginData);
	};

	const handleSendOtp = (e) => {
		e.preventDefault();
		if (!forgotEmail) {
			toast.error("Vui lòng nhập email");
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(forgotEmail)) {
			toast.error("Email không hợp lệ");
			return;
		}
		sendOtpMutation.mutate({ email: forgotEmail });
	};

	const handleResetPassword = (e) => {
		e.preventDefault();

		if (otp.length !== 6) {
			toast.error("Vui lòng nhập đủ 6 số OTP");
			return;
		}

		if (!newPassword || newPassword.length < 6) {
			toast.error("Mật khẩu phải có ít nhất 6 ký tự");
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error("Mật khẩu xác nhận không khớp");
			return;
		}

		forgotPasswordMutation.mutate({
			email: forgotEmail,
			otp: otp,
			newPassword: newPassword,
		});
	};

	const resetForgotPassword = () => {
		setForgotStep(1);
		setForgotEmail("");
		setOtp("");
		setNewPassword("");
		setConfirmPassword("");
		setShowNewPassword(false);
	};

	const handleClose = () => {
		setLoginData({ username: "", password: "" });
		setShowPassword(false);
		resetForgotPassword();
		onClose();
	};

	return (
		<Dialog open={true} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px] p-0">
				<Tabs defaultValue="login" className="w-full">
					<DialogHeader className="px-6 pt-6 pb-2">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="login">Đăng nhập</TabsTrigger>
							<TabsTrigger value="forgot">Quên mật khẩu</TabsTrigger>
						</TabsList>
					</DialogHeader>

					{/* Login Tab */}
					<TabsContent value="login" className="px-6 pb-6">
						<DialogTitle className="text-2xl font-bold text-center mb-2">
							Chào mừng trở lại
						</DialogTitle>
						<DialogDescription className="text-center mb-6">
							Đăng nhập để tiếp tục sử dụng dịch vụ
						</DialogDescription>

						<form
							onSubmit={handleLoginSubmit}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label htmlFor="username">Tên đăng nhập</Label>
								<Input
									id="username"
									placeholder="Nhập tên đăng nhập"
									value={loginData.username}
									onChange={(e) =>
										setLoginData({
											...loginData,
											username: e.target.value,
										})
									}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Mật khẩu</Label>
								<div className="relative">
									<Input
										id="password"
										type={
											showPassword
												? "text"
												: "password"
										}
										placeholder="Nhập mật khẩu"
										value={loginData.password}
										onChange={(e) =>
											setLoginData({
												...loginData,
												password: e.target.value,
											})
										}
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={loginMutation.isPending}
							>
								<LogIn className="w-4 h-4 mr-2" />
								{loginMutation.isPending
									? "Đang đăng nhập..."
									: "Đăng nhập"}
							</Button>
						</form>

						<div className="my-6 flex items-center gap-4">
							<Separator className="flex-1" />
							<span className="text-xs text-muted-foreground">
								HOẶC
							</span>
							<Separator className="flex-1" />
						</div>

						<div className="mt-6 text-center text-sm">
							<span className="text-muted-foreground">
								Chưa có tài khoản?{" "}
							</span>
							<button
								type="button"
								onClick={() => {
									handleClose();
									navigate("/register-customer");
								}}
								className="text-primary hover:underline font-medium"
							>
								Đăng ký ngay
							</button>
						</div>
					</TabsContent>

					{/* Forgot Password Tab */}
					<TabsContent value="forgot" className="px-6 pb-6">
						<DialogTitle className="text-2xl font-bold text-center mb-2">
							Quên mật khẩu
						</DialogTitle>
						<DialogDescription className="text-center mb-6">
							{forgotStep === 1
								? "Nhập email để nhận mã OTP"
								: "Nhập mã OTP và mật khẩu mới"}
						</DialogDescription>

						{forgotStep === 1 ? (
							<form onSubmit={handleSendOtp} className="space-y-4">
								<div className="space-y-2">
									<Label
										htmlFor="email"
										className="flex items-center gap-2"
									>
										<Mail className="w-4 h-4" />
										Email
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="example@email.com"
										value={forgotEmail}
										onChange={(e) =>
											setForgotEmail(e.target.value)
										}
									/>
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={sendOtpMutation.isPending}
								>
									<Mail className="w-4 h-4 mr-2" />
									{sendOtpMutation.isPending
										? "Đang gửi..."
										: "Gửi mã OTP"}
								</Button>
							</form>
						) : (
							<form onSubmit={handleResetPassword} className="space-y-4">
								<div className="space-y-2">
									<Label className="flex items-center gap-2">
										<KeyRound className="w-4 h-4" />
										Mã OTP
									</Label>
									<div className="flex justify-center">
										<InputOTP
											maxLength={6}
											value={otp}
											onChange={setOtp}
										>
											<InputOTPGroup>
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>
									</div>
									<div className="text-center">
										<button
											type="button"
											onClick={() =>
												sendOtpMutation.mutate({
													email: forgotEmail,
												})
											}
											disabled={sendOtpMutation.isPending}
											className="text-xs text-primary hover:underline"
										>
											Gửi lại mã OTP
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="newPassword"
										className="flex items-center gap-2"
									>
										<Lock className="w-4 h-4" />
										Mật khẩu mới
									</Label>
									<div className="relative">
										<Input
											id="newPassword"
											type={
												showNewPassword
													? "text"
													: "password"
											}
											placeholder="Nhập mật khẩu mới"
											value={newPassword}
											onChange={(e) =>
												setNewPassword(e.target.value)
											}
										/>
										<button
											type="button"
											onClick={() =>
												setShowNewPassword(!showNewPassword)
											}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											{showNewPassword ? (
												<EyeOff className="w-4 h-4" />
											) : (
												<Eye className="w-4 h-4" />
											)}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirmPassword">
										Xác nhận mật khẩu
									</Label>
									<Input
										id="confirmPassword"
										type={
											showNewPassword
												? "text"
												: "password"
										}
										placeholder="Nhập lại mật khẩu mới"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
									/>
								</div>

								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										className="flex-1"
										onClick={() => setForgotStep(1)}
										disabled={forgotPasswordMutation.isPending}
									>
										Quay lại
									</Button>
									<Button
										type="submit"
										className="flex-1"
										disabled={forgotPasswordMutation.isPending}
									>
										<KeyRound className="w-4 h-4 mr-2" />
										{forgotPasswordMutation.isPending
											? "Đang xử lý..."
											: "Đặt lại mật khẩu"}
									</Button>
								</div>
							</form>
						)}

						<div className="mt-6 text-center text-sm">
							<span className="text-muted-foreground">
								Đã nhớ mật khẩu?{" "}
							</span>
							<button
								type="button"
								onClick={() => {
									resetForgotPassword();
									document.querySelector('[value="login"]')?.click();
								}}
								className="text-primary hover:underline font-medium"
							>
								Đăng nhập
							</button>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

export default LoginModal;

