import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import useCustomMutation from '@/hooks/useCustomMutation';
import { authApi } from '@/api/authApi';
import { sellerApi } from '@/api/sellerApi';
import { Store, User, ShieldCheck, Mail, Lock, Phone, UserCircle, MapPin, FileText, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

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

  const isFormDisabled = sendOtpMutation.isPending || verifyOtpMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl relative z-10"
      >
        <Card className="border-2 shadow-2xl overflow-hidden backdrop-blur-sm bg-card/95">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-b pb-8">
            <div className="flex items-center justify-center mb-4">
              <motion.div 
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Store className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <CardTitle className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
              Đăng ký Người bán
            </CardTitle>
            <CardDescription className="text-center text-lg mt-2">
              Tạo tài khoản để bắt đầu bán sách trên nền tảng của chúng tôi
            </CardDescription>

            {/* Progress Steps */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <div className={`flex items-center gap-3 transition-all ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step >= 1 ? 'bg-primary border-primary text-white' : 'bg-background border-muted-foreground'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </motion.div>
                  <span className="text-sm font-semibold hidden sm:block">Thông tin</span>
                </div>

                <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />

                <div className={`flex items-center gap-3 transition-all ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step >= 2 ? 'bg-primary border-primary text-white' : 'bg-background border-muted-foreground'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </motion.div>
                  <span className="text-sm font-semibold hidden sm:block">Xác thực</span>
                </div>

                <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />

                <div className={`flex items-center gap-3 transition-all ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step >= 3 ? 'bg-primary border-primary text-white' : 'bg-background border-muted-foreground'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Store className="w-5 h-5" />
                  </motion.div>
                  <span className="text-sm font-semibold hidden sm:block">Cửa hàng</span>
                </div>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            {/* Step 1: Profile Information */}
            {step === 1 && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep1Submit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-primary" />
                      Tên đăng nhập *
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Nhập tên đăng nhập"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={isFormDisabled}
                      className={`transition-all ${errors.username ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.username && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <span className="text-xs">●</span> {errors.username}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isFormDisabled}
                      className={`transition-all ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <span className="text-xs">●</span> {errors.email}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Họ và tên *
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className={`transition-all ${errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                  />
                  {errors.fullName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-1"
                    >
                      <span className="text-xs">●</span> {errors.fullName}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Số điện thoại *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className={`transition-all ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                  />
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-1"
                    >
                      <span className="text-xs">●</span> {errors.phone}
                    </motion.p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Mật khẩu *
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isFormDisabled}
                      className={`transition-all ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <span className="text-xs">●</span> {errors.password}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Xác nhận mật khẩu *
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isFormDisabled}
                      className={`transition-all ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                    />
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <span className="text-xs">●</span> {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg group"
                  disabled={sendOtpMutation.isPending}
                >
                  {sendOtpMutation.isPending ? (
                    <>
                      <Spinner className="mr-2" />
                      Đang gửi OTP...
                    </>
                  ) : (
                    <>
                      Tiếp tục
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-primary font-semibold hover:underline transition-all"
                    disabled={isFormDisabled}
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <motion.div 
                    className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center border-2 border-primary/30"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mail className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-bold">Xác thực OTP</h3>
                  <p className="text-muted-foreground">
                    Mã OTP đã được gửi đến email
                  </p>
                  <Badge variant="secondary" className="text-base px-4 py-1">
                    {formData.email}
                  </Badge>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    disabled={isFormDisabled}
                  >
                    <InputOTPGroup className="gap-3">
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl border-2" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 group"
                    onClick={() => setStep(1)}
                    disabled={isFormDisabled}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Quay lại
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg group"
                    onClick={handleOtpSubmit}
                    disabled={verifyOtpMutation.isPending || otp.length !== 6}
                  >
                    {verifyOtpMutation.isPending ? (
                      <>
                        <Spinner className="mr-2" />
                        Đang xác thực...
                      </>
                    ) : (
                      <>
                        Xác thực
                        <CheckCircle2 className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Không nhận được mã?</p>
                  <button
                    type="button"
                    className="text-sm text-primary font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all"
                    onClick={() => sendOtpMutation.mutate({ email: formData.email })}
                    disabled={sendOtpMutation.isPending || verifyOtpMutation.isPending}
                  >
                    {sendOtpMutation.isPending && <Spinner className="w-4 h-4" />}
                    Gửi lại mã OTP
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Store Information */}
            {step === 3 && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleStep3Submit}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <motion.div 
                    className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center border-2 border-primary/30 mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Store className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-bold">Thông tin cửa hàng</h3>
                  <p className="text-muted-foreground mt-2">
                    Hoàn tất thông tin để bắt đầu bán hàng
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName" className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary" />
                    Tên cửa hàng *
                  </Label>
                  <Input
                    id="storeName"
                    name="storeName"
                    placeholder="Nhập tên cửa hàng"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className={`transition-all ${errors.storeName ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                  />
                  {errors.storeName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-1"
                    >
                      <span className="text-xs">●</span> {errors.storeName}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Địa chỉ cửa hàng *
                  </Label>
                  <Input
                    id="storeAddress"
                    name="storeAddress"
                    placeholder="Số nhà, đường, phường, quận, thành phố"
                    value={formData.storeAddress}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    className={`transition-all ${errors.storeAddress ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                  />
                  {errors.storeAddress && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-1"
                    >
                      <span className="text-xs">●</span> {errors.storeAddress}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeDescription" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Mô tả cửa hàng *
                  </Label>
                  <Textarea
                    id="storeDescription"
                    name="storeDescription"
                    placeholder="Mô tả về cửa hàng của bạn..."
                    value={formData.storeDescription}
                    onChange={handleInputChange}
                    disabled={isFormDisabled}
                    rows={4}
                    className={`transition-all ${errors.storeDescription ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-primary'}`}
                  />
                  {errors.storeDescription && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-1"
                    >
                      <span className="text-xs">●</span> {errors.storeDescription}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 group"
                    onClick={() => setStep(2)}
                    disabled={isFormDisabled}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg group"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Spinner className="mr-2" />
                        Đang đăng ký...
                      </>
                    ) : (
                      <>
                        Hoàn tất đăng ký
                        <CheckCircle2 className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterSeller;
