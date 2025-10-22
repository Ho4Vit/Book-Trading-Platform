import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cartApi, orderApi, paymentApi, customerApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    ShoppingCart,
    CreditCard,
    MapPin,
    User,
    Phone,
    Mail,
    Home,
    ChevronRight,
    Package,
    Truck,
    CheckCircle2,
    AlertCircle,
    Wallet,
    Edit,
} from "lucide-react";

export default function PaymentCheckout() {
    const navigate = useNavigate();
    const { userId: rawUserId } = useAuthStore();
    const userId = Number(rawUserId);
    const queryClient = useQueryClient();

    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState("COD");

    // Shipping info state
    const [shippingInfo, setShippingInfo] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        note: "",
    });

    // Fetch cart data
    const { data: cartData, isLoading: cartLoading } = useCustomQuery(
        ["cart", userId],
        () => cartApi.getCartByCustomerId(userId),
        {
            enabled: !!userId,
            refetchOnWindowFocus: false,
        }
    );

    // Fetch customer data
    const { data: customerData, isLoading: customerLoading } = useCustomQuery(
        ["customer", userId],
        () => customerApi.getCustomerById(userId),
        {
            enabled: !!userId,
        }
    );

    // Auto-fill customer information when data is loaded
    useEffect(() => {
        if (customerData) {
            const customer = customerData?.data || customerData;
            if (customer) {
                setShippingInfo({
                    fullName: customer.fullName || "",
                    phone: customer.phone || "",
                    email: customer.email || "",
                    address: customer.address || "",
                    note: "",
                });
            }
        }
    }, [customerData]);

    // Create order mutation
    const createOrderMutation = useCustomMutation(
        (orderData) => orderApi.createOrder(orderData),
        null,
        {
            onSuccess: (response) => {
                const order = response?.data || response;

                // Clear cart
                queryClient.invalidateQueries(["cart", userId]);

                // Navigate based on payment method
                if (paymentMethod === "MOMO") {
                    // Create MoMo payment
                    createMomoPayment(order);
                } else {
                    toast.success("Đặt hàng thành công!");
                    navigate("/customer/orders");
                }
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể tạo đơn hàng");
            },
        }
    );

    // Create MoMo payment mutation
    const createMomoMutation = useCustomMutation(
        (paymentData) => paymentApi.createMomo(paymentData),
        null,
        {
            onSuccess: (response) => {
                const payUrl = response?.data?.payUrl || response?.payUrl;
                if (payUrl) {
                    // Redirect to MoMo payment page
                    window.location.href = payUrl;
                } else {
                    toast.error("Không thể tạo thanh toán MoMo");
                }
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể tạo thanh toán MoMo");
            },
        }
    );

    const createMomoPayment = (order) => {
        createMomoMutation.mutate({
            orderId: order.id,
            amount: order.totalPrice,
            orderInfo: `Thanh toán đơn hàng ${order.id}`,
            returnUrl: "http://localhost:5173/payment/success",
            notifyUrl: "http://localhost:8080/api/payments/momo/callback",
        });
    };

    // Process cart data
    const cartResponse = cartData?.data || cartData;
    const cartItems = cartResponse?.cartItems || [];
    const totalPrice = cartResponse?.totalPrice || 0;
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Group items by seller
    const groupedBySeller = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            const storeName = item.storeName || "Unknown Seller";
            if (!acc[storeName]) {
                acc[storeName] = [];
            }
            acc[storeName].push(item);
            return acc;
        }, {});
    }, [cartItems]);

    // Form validation
    const isFormValid = useMemo(() => {
        return (
            shippingInfo.fullName.trim() !== "" &&
            shippingInfo.phone.trim() !== "" &&
            shippingInfo.address.trim() !== "" &&
            shippingInfo.email.trim() !== ""
        );
    }, [shippingInfo]);

    const handleInputChange = (field, value) => {
        setShippingInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePlaceOrder = () => {
        if (!isFormValid) {
            toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }

        // Prepare order data - matching API specification
        const orderData = {
            customerId: userId,
            items: cartItems.map((item) => ({
                bookId: item.bookId,
                quantity: item.quantity,
            })),
        };

        createOrderMutation.mutate(orderData);
    };

    const isLoading = cartLoading || customerLoading;
    const isProcessing = createOrderMutation.isPending || createMomoMutation.isPending;

    if (isLoading) {
        return (
            <div className="w-full">
                <Skeleton className="h-10 w-64 mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Redirect if cart is empty
    if (cartItems.length === 0) {
        navigate("/customer/cart");
        return null;
    }

    return (
        <div className="w-full">
            {/* Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm">
                    <Home className="w-4 h-4" />
                    <a href="/" className="hover:text-primary transition-colors">
                        Trang chủ
                    </a>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <a
                        href="/customer/cart"
                        className="hover:text-primary transition-colors"
                    >
                        Giỏ hàng
                    </a>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Thanh toán</span>
                </div>
            </div>

            <div>
                {/* Page Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Thanh toán</h1>
                        <p className="text-muted-foreground">
                            Hoàn tất đơn hàng của bạn
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information */}
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        Thông tin giao hàng
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate("/customer/profile")}
                                        className="gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Cập nhật hồ sơ
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Information notice */}
                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-sm text-blue-600">
                                        Thông tin đã được tự động điền từ hồ sơ của bạn. Vui lòng kiểm tra và chỉnh sửa nếu cần.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Họ và tên <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="fullName"
                                            placeholder="Nguyễn Văn A"
                                            value={shippingInfo.fullName}
                                            onChange={(e) =>
                                                handleInputChange("fullName", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="phone"
                                            placeholder="0123456789"
                                            value={shippingInfo.phone}
                                            onChange={(e) =>
                                                handleInputChange("phone", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={shippingInfo.email}
                                        onChange={(e) =>
                                            handleInputChange("email", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="flex items-center gap-2">
                                        <Home className="w-4 h-4" />
                                        Địa chỉ giao hàng <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                        value={shippingInfo.address}
                                        onChange={(e) =>
                                            handleInputChange("address", e.target.value)
                                        }
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                                    <Textarea
                                        id="note"
                                        placeholder="Ghi chú cho người bán..."
                                        value={shippingInfo.note}
                                        onChange={(e) =>
                                            handleInputChange("note", e.target.value)
                                        }
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-primary" />
                                    Phương thức thanh toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={setPaymentMethod}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center space-x-3 border-2 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                                        <RadioGroupItem value="COD" id="cod" />
                                        <Label
                                            htmlFor="cod"
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <Truck className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    Thanh toán khi nhận hàng (COD)
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Thanh toán bằng tiền mặt khi nhận hàng
                                                </p>
                                            </div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 border-2 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                                        <RadioGroupItem value="MOMO" id="momo" />
                                        <Label
                                            htmlFor="momo"
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-pink-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Ví MoMo</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Thanh toán qua ví điện tử MoMo
                                                </p>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        {/* Order Items Review */}
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    Xem lại đơn hàng ({cartCount} sản phẩm)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(groupedBySeller).map(([storeName, items]) => (
                                    <div key={storeName} className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                            <Package className="w-4 h-4" />
                                            {storeName}
                                        </div>
                                        {items.map((item) => (
                                            <div
                                                key={item.bookId}
                                                className="flex gap-4 pb-3 border-b last:border-0"
                                            >
                                                <img
                                                    src={
                                                        item.imgUrl ||
                                                        "https://via.placeholder.com/80x100"
                                                    }
                                                    alt={item.bookName}
                                                    className="w-16 h-20 object-cover rounded border"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium line-clamp-1 mb-1">
                                                        {item.bookName}
                                                    </h4>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            x{item.quantity}
                                                        </span>
                                                        <span className="font-semibold text-primary">
                                                            {(
                                                                item.price * item.quantity
                                                            ).toLocaleString("vi-VN")}
                                                            ₫
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-4">
                            <Card className="border-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5 text-primary" />
                                        Tóm tắt đơn hàng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Tạm tính ({cartCount} sản phẩm)
                                            </span>
                                            <span className="font-semibold">
                                                {totalPrice.toLocaleString("vi-VN")}₫
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Phí vận chuyển
                                            </span>
                                            <span className="font-semibold text-green-600">
                                                Miễn phí
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold">Tổng cộng</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {totalPrice.toLocaleString("vi-VN")}₫
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <Button
                                        size="lg"
                                        className="w-full gap-2 h-12 text-base font-semibold"
                                        onClick={handlePlaceOrder}
                                        disabled={!isFormValid || isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Đặt hàng ngay
                                            </>
                                        )}
                                    </Button>

                                    {!isFormValid && (
                                        <Alert className="bg-orange-50 border-orange-200">
                                            <AlertCircle className="h-4 w-4 text-orange-600" />
                                            <AlertDescription className="text-xs text-orange-600">
                                                Vui lòng điền đầy đủ thông tin giao hàng
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <Alert className="bg-primary/5 border-primary/20">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        <AlertDescription className="text-xs">
                                            Đơn hàng của bạn sẽ được giao trong 2-3 ngày
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-2">
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm">Miễn phí vận chuyển</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm">Sách chính hãng 100%</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm">Hỗ trợ đổi trả trong 7 ngày</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
