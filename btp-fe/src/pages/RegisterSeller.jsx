import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import useCustomMutation from '@/hooks/useCustomMutation';
import { authApi } from '@/api/authApi';
import { sellerApi } from '@/api/sellerApi';
import { Store, User, ShieldCheck } from 'lucide-react';

const RegisterSeller = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    storeName: '',
    storeAddress: '',
    storeDescription: '',
  });

  const [errors, setErrors] = useState({});

  // API Mutations
  const sendOtpMutation = useCustomMutation(
    (data) => authApi.otpLogin(data),
    'POST',
    {
      onSuccess: () => {
        toast.success('Mã OTP đã được gửi đến email của bạn!');
        setStep(2);
      },
    }
  );

  const verifyOtpMutation = useCustomMutation(
    (data) => authApi.verifyOtp(data),
    'POST',
    {
      onSuccess: () => {
        toast.success('Xác thực OTP thành công!');
        setStep(3);
      },
    }
  );

  const registerMutation = useCustomMutation(
    (data) => sellerApi.registerSeller(data),
    'POST',
    {
      onSuccess: (response) => {
        toast.success('Đăng ký thành công! Chào mừng bạn đến với Book Trading Platform!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      },
    }
  );

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Vietnam phone format: (+84|84|0) + (3|5|7|8|9) + 8 digits
    const phoneRegex = /^(\+84|84|0)[35789]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Step 1: Profile validation and submission
  const handleStep1Submit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678, +84912345678)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Send OTP
    sendOtpMutation.mutate({ email: formData.email });
  };

  // Step 2: OTP verification
  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    verifyOtpMutation.mutate({
      email: formData.email,
      otpInput: otp,
    });
  };

  // Step 3: Store information and final registration
  const handleStep3Submit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Tên cửa hàng không được để trống';
    }

    if (!formData.storeAddress.trim()) {
      newErrors.storeAddress = 'Địa chỉ cửa hàng không được để trống';
    }

    if (!formData.storeDescription.trim()) {
      newErrors.storeDescription = 'Mô tả cửa hàng không được để trống';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit registration
    const registrationData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone,
      storeName: formData.storeName,
      storeAddress: formData.storeAddress,
      storeDescription: formData.storeDescription,
    };

    registerMutation.mutate(registrationData);
  };

  // Calculate progress
  const getProgress = () => {
    switch (step) {
      case 1:
        return 33;
      case 2:
        return 66;
      case 3:
        return 100;
      default:
        return 0;
    }
  };

  const getStepIcon = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return <User className="w-5 h-5" />;
      case 2:
        return <ShieldCheck className="w-5 h-5" />;
      case 3:
        return <Store className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Đăng ký Người bán</CardTitle>
          <CardDescription className="text-center">
            Tạo tài khoản để bắt đầu bán sách trên nền tảng của chúng tôi
          </CardDescription>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                {getStepIcon(1)}
                <span className="text-sm font-medium">Thông tin</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                {getStepIcon(2)}
                <span className="text-sm font-medium">Xác thực OTP</span>
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                {getStepIcon(3)}
                <span className="text-sm font-medium">Cửa hàng</span>
              </div>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: Profile Information */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập *</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="0912345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? 'Đang gửi...' : 'Tiếp tục'}
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Xác thực OTP</h3>
                <p className="text-sm text-muted-foreground">
                  Mã OTP đã được gửi đến email: <strong>{formData.email}</strong>
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
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

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={verifyOtpMutation.isPending}
                >
                  Quay lại
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleOtpSubmit}
                  disabled={verifyOtpMutation.isPending || otp.length !== 6}
                >
                  {verifyOtpMutation.isPending ? 'Đang xác thực...' : 'Xác thực'}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => sendOtpMutation.mutate({ email: formData.email })}
                  disabled={sendOtpMutation.isPending}
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Store Information */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Tên cửa hàng *</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  placeholder="Nhập tên cửa hàng"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className={errors.storeName ? 'border-red-500' : ''}
                />
                {errors.storeName && <p className="text-sm text-red-500">{errors.storeName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress">Địa chỉ cửa hàng *</Label>
                <Input
                  id="storeAddress"
                  name="storeAddress"
                  placeholder="Số nhà, đường, phường, quận, thành phố"
                  value={formData.storeAddress}
                  onChange={handleInputChange}
                  className={errors.storeAddress ? 'border-red-500' : ''}
                />
                {errors.storeAddress && <p className="text-sm text-red-500">{errors.storeAddress}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Mô tả cửa hàng *</Label>
                <Textarea
                  id="storeDescription"
                  name="storeDescription"
                  placeholder="Mô tả về cửa hàng của bạn..."
                  value={formData.storeDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className={errors.storeDescription ? 'border-red-500' : ''}
                />
                {errors.storeDescription && <p className="text-sm text-red-500">{errors.storeDescription}</p>}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                  disabled={registerMutation.isPending}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? 'Đang đăng ký...' : 'Hoàn tất đăng ký'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => navigate('/')}
            >
              Đăng nhập ngay
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterSeller;
