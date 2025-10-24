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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cartApi, orderApi, paymentApi, customerApi, discountApi } from "@/api";
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
    Ticket,
    X,
    Percent,
    Tag,
} from "lucide-react";

export default function PaymentCheckout() {
    const navigate = useNavigate();
    const { userId: rawUserId } = useAuthStore();
    const userId = Number(rawUserId);
    const queryClient = useQueryClient();

    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState("COD");

    // Discount state
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [showVoucherDialog, setShowVoucherDialog] = useState(false);

    // Shipping info state
    const [shippingInfo, setShippingInfo] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        note: "",
    });

    // Load selected items and applied discount from sessionStorage
    const [selectedCartItems, setSelectedCartItems] = useState([]);

    useEffect(() => {
        // Load selected items from sessionStorage (set by CustomerCart)
        const storedItems = sessionStorage.getItem('selectedCartItems');
        const storedDiscount = sessionStorage.getItem('appliedDiscount');

        if (storedItems) {
            try {
                const items = JSON.parse(storedItems);
                setSelectedCartItems(items);
            } catch (error) {
                console.error("Error parsing selected items:", error);
            }
        }

        if (storedDiscount) {
            try {
                const discount = JSON.parse(storedDiscount);
                setSelectedDiscount(discount);
            } catch (error) {
                console.error("Error parsing discount:", error);
            }
        }
    }, []);

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

    // Process cart data first to get totalPrice for discount query
    const cartResponse = cartData?.data || cartData;
    const allCartItems = cartResponse?.cartItems || [];

    // Use selected items from sessionStorage if available, otherwise use all cart items
    const cartItems = selectedCartItems.length > 0 ? selectedCartItems : allCartItems;
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Fetch available discounts for user based on order value
    const { data: discountsData, isLoading: discountsLoading } = useCustomQuery(
        ["availableDiscounts", userId, totalPrice],
        () => discountApi.getDiscountForUser(userId, totalPrice),
        {
            enabled: !!userId && totalPrice > 0,
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
            onSuccess: async (response) => {
                const order = response?.data || response;

                // Save discount usage if a discount was applied
                if (selectedDiscount) {
                    try {
                        await discountApi.saveUserUseDiscounts(selectedDiscount.id, userId);
                        console.log("Discount usage saved successfully");
                    } catch (error) {
                        console.error("Failed to save discount usage:", error);
                        // Continue with order even if discount saving fails
                    }
                }

                // Clear sessionStorage after order is created
                sessionStorage.removeItem('selectedCartItems');
                sessionStorage.removeItem('appliedDiscount');

                // Clear selected items from cart (only the ones that were ordered)
                try {
                    // Remove each item from cart
                    const removePromises = cartItems.map(item =>
                        cartApi.removeFromCart(userId, item.bookId)
                    );
                    await Promise.all(removePromises);

                    // Invalidate cart query to refresh the data
                    queryClient.invalidateQueries(["cart", userId]);
                } catch (error) {
                    console.error("Error clearing cart:", error);
                    // Continue with payment even if cart clearing fails
                }

                // Create payment based on payment method
                if (paymentMethod === "MOMO") {
                    // Create MoMo payment
                    createMomoPayment(order);
                } else {
                    // Create COD payment
                    createCODPayment(order);
                }
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể tạo đơn hàng");
            },
        }
    );

    // Create COD payment mutation
    const createCODPaymentMutation = useCustomMutation(
        (paymentData) => paymentApi.createPayment(paymentData),
        null,
        {
            onSuccess: () => {
                toast.success("Đặt hàng thành công!");
                navigate("/customer/orders");
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể tạo thanh toán");
            },
        }
    );

    // Create MoMo payment mutation
    const createMomoMutation = useCustomMutation(
        (paymentData) => paymentApi.createMomo(paymentData),
        null,
        {
            onSuccess: (response) => {
                console.log("MoMo Response:", response);

                const payUrl = response?.payUrl;
                const resultCode = String(response?.resultCode || "");

                // Check if payUrl exists and resultCode is success
                if (payUrl && (resultCode === "0" || resultCode === "00")) {
                    // Redirect to MoMo payment page (shows QR code)
                    window.location.href = payUrl;
                } else {
                    console.error("MoMo payment failed:", response);
                    toast.error(response?.message || "Không thể tạo thanh toán MoMo");
                }
            },
            onError: (error) => {
                console.error("MoMo API Error:", error);
                toast.error(error?.message || "Không thể tạo thanh toán MoMo");
            },
        }
    );

    const createCODPayment = (order) => {
        createCODPaymentMutation.mutate({
            orderId: order.id,
            amount: order.totalPrice,
            method: "COD",
            discount: discountAmount,
        });
    };

    const createMomoPayment = (order) => {
        createMomoMutation.mutate({
            transactionId: order.transactionId,
            orderId: order.id,
            orderInfo: `Thanh toán đơn hàng ${order.id}`,
            discount: discountAmount,
            returnUrl: "http://localhost:5173/payment/success",
            notifyUrl: "http://localhost:8080/api/payments/momo/callback",
        });
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Available discounts
    const availableDiscounts = useMemo(() => {
        const discounts = Array.isArray(discountsData?.data)
            ? discountsData.data
            : Array.isArray(discountsData)
            ? discountsData
            : [];

        return discounts.filter(d => d.active && new Date(d.expiryDate) > new Date());
    }, [discountsData]);

    // Calculate discount amount based on applicable books
    const discountAmount = useMemo(() => {
        if (!selectedDiscount) return 0;

        // Filter cart items that the discount applies to
        const applicableItems = cartItems.filter(item =>
            selectedDiscount.applicableBookIds?.includes(item.bookId)
        );

        const applicableTotal = applicableItems.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0
        );

        if (selectedDiscount.percentage) {
            return Math.round((applicableTotal * selectedDiscount.discountAmount) / 100);
        } else {
            return Math.min(selectedDiscount.discountAmount, applicableTotal);
        }
    }, [selectedDiscount, cartItems]);

    // Calculate final price after discount
    const finalPrice = useMemo(() => {
        return Math.max(0, totalPrice - discountAmount);
    }, [totalPrice, discountAmount]);

    // Find best discount (one that gives maximum discount)
    const bestDiscount = useMemo(() => {
        if (availableDiscounts.length === 0) return null;

        return availableDiscounts.reduce((best, current) => {
            const currentDiscount = current.percentage
                ? (totalPrice * current.discountAmount) / 100
                : current.discountAmount;

            const bestCurrentDiscount = best.percentage
                ? (totalPrice * best.discountAmount) / 100
                : best.discountAmount;

            return currentDiscount > bestCurrentDiscount ? current : best;
        }, availableDiscounts[0]);
    }, [availableDiscounts, totalPrice]);

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

    const handleApplyDiscount = (discount) => {
        setSelectedDiscount(discount);
        setShowVoucherDialog(false);
        toast.success(`Đã áp dụng voucher ${discount.code}`);
    };

    const handleRemoveDiscount = () => {
        setSelectedDiscount(null);
        toast.success("Đã gỡ voucher");
    };

    const isLoading = cartLoading || customerLoading;
    const isProcessing = createOrderMutation.isPending || createMomoMutation.isPending || createCODPaymentMutation.isPending;

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

                                        {/* Voucher Section */}
                                        {availableDiscounts.length > 0 && (
                                            <>
                                                <Separator />
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium flex items-center gap-2">
                                                            <Ticket className="w-4 h-4 text-primary" />
                                                            Voucher giảm giá
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs gap-1"
                                                            onClick={() => setShowVoucherDialog(true)}
                                                        >
                                                            <Tag className="w-3 h-3" />
                                                            Chọn voucher
                                                        </Button>
                                                    </div>

                                                    {selectedDiscount ? (
                                                        <div className="p-3 bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20 rounded-lg">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white">
                                                                        {selectedDiscount.code}
                                                                    </Badge>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={handleRemoveDiscount}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-muted-foreground">Giảm giá:</span>
                                                                <span className="font-semibold text-green-600">
                                                                    -{discountAmount.toLocaleString("vi-VN")}₫
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : bestDiscount && (
                                                        <Alert className="bg-amber-50 border-amber-200 p-3">
                                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                                            <AlertDescription className="text-xs text-amber-800">
                                                                <strong>Gợi ý:</strong> Sử dụng voucher <strong>{bestDiscount.code}</strong> để giảm{" "}
                                                                {bestDiscount.percentage ? `${bestDiscount.discountAmount}%` : `${bestDiscount.discountAmount.toLocaleString("vi-VN")}₫`}
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-semibold">Tổng cộng</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {finalPrice.toLocaleString("vi-VN")}₫
                                            </span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="text-xs text-muted-foreground text-right">
                                                Tiết kiệm: {discountAmount.toLocaleString("vi-VN")}₫
                                            </div>
                                        )}
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

            {/* Voucher Selection Dialog */}
            <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-primary" />
                            Chọn Voucher Giảm Giá
                        </DialogTitle>
                        <DialogDescription>
                            Chọn voucher phù hợp để giảm giá đơn hàng của bạn
                        </DialogDescription>
                    </DialogHeader>

                    {discountsLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    ) : availableDiscounts.length === 0 ? (
                        <div className="text-center py-8">
                            <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                Không có voucher khả dụng cho đơn hàng này
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {availableDiscounts.map((discount) => {
                                const discountValue = discount.percentage
                                    ? (totalPrice * discount.discountAmount) / 100
                                    : discount.discountAmount;
                                const isSelected = selectedDiscount?.id === discount.id;
                                const isBest = bestDiscount?.id === discount.id;

                                return (
                                    <Card
                                        key={discount.id}
                                        className={`cursor-pointer transition-all hover:shadow-md ${
                                            isSelected
                                                ? "border-2 border-primary bg-primary/5"
                                                : "border hover:border-primary/50"
                                        }`}
                                        onClick={() => handleApplyDiscount(discount)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <Ticket className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-lg">
                                                                    {discount.code}
                                                                </span>
                                                                {isBest && (
                                                                    <Badge className="bg-amber-500 hover:bg-amber-600">
                                                                        Tốt nhất
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                {discount.provider}
                                                            </p>
                                                        </div>
                                                        {isSelected && (
                                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-2">
                                                        {discount.percentage ? (
                                                            <span className="text-primary font-bold text-xl flex items-center gap-1">
                                                                <Percent className="w-4 h-4" />
                                                                {discount.discountAmount}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-primary font-bold text-xl">
                                                                -{discount.discountAmount.toLocaleString("vi-VN")}₫
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1 text-xs text-muted-foreground">
                                                        {discount.minOrderValue > 0 && (
                                                            <p>
                                                                • Đơn tối thiểu:{" "}
                                                                {discount.minOrderValue.toLocaleString("vi-VN")}₫
                                                            </p>
                                                        )}
                                                        <p>
                                                            • HSD:{" "}
                                                            {new Date(discount.expiryDate).toLocaleDateString("vi-VN")}
                                                        </p>
                                                        <p className="font-semibold text-green-600">
                                                            → Tiết kiệm: {discountValue.toLocaleString("vi-VN")}₫
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
