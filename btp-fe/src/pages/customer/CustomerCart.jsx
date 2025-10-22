import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MaybeYouLike from "@/components/MaybeYouLike";
import { cartApi, bookApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    ShoppingBag,
    AlertCircle,
    Store,
    Package,
    Sparkles,
    Home,
    ChevronRight,
} from "lucide-react";

export default function CustomerCart() {
    const navigate = useNavigate();
    const { userId: rawUserId } = useAuthStore();
    const userId = Number(rawUserId);
    const queryClient = useQueryClient();
    const [removingItems, setRemovingItems] = useState(new Set());
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    // Fetch cart data
    const { data: cartData, isLoading } = useCustomQuery(
        ["cart", userId],
        () => cartApi.getCartByCustomerId(userId),
        {
            enabled: !!userId,
            refetchOnWindowFocus: true,
        }
    );

    // Fetch all books for recommendations
    const { data: allBooksData } = useCustomQuery(
        ["books"],
        () => bookApi.getAllBooks(),
        { staleTime: 1000 * 60 * 5 }
    );

    // Remove from cart mutation
    const removeMutation = useCustomMutation(
        ({ bookId }) => cartApi.removeFromCart(userId, bookId),
        null,
        {
            onMutate: async ({ bookId }) => {
                setRemovingItems((prev) => new Set(prev).add(bookId));
            },
            onSuccess: () => {
                toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
                queryClient.invalidateQueries(["cart", userId]);
            },
            onError: (error, { bookId }) => {
                toast.error(error?.message || "Không thể xóa sản phẩm");
                setRemovingItems((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(bookId);
                    return newSet;
                });
            },
            onSettled: (data, error, { bookId }) => {
                setRemovingItems((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(bookId);
                    return newSet;
                });
            },
        }
    );


    const updateQuantityMutation = useCustomMutation(
        ({ bookId, quantity }) =>
            cartApi.addToCart({
                userId,
                cartItems: [{ bookId, quantity }],
            }),
        null,
        {
            onMutate: async ({ bookId, quantity }) => {
                await queryClient.cancelQueries(["cart", userId]);

                const previousCart = queryClient.getQueryData(["cart", userId]);

                queryClient.setQueryData(["cart", userId], (old) => {
                    if (!old) return old;
                    const cart = old.data || old;
                    const updatedItems = cart.cartItems.map((item) =>
                        item.bookId === bookId
                            ? { ...item, quantity: Math.max(1, item.quantity + quantity) }
                            : item
                    );

                    const totalPrice = updatedItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );

                    return {
                        ...cart,
                        cartItems: updatedItems,
                        totalPrice,
                    };
                });

                return { previousCart };
            },

            onError: (err, _, context) => {
                toast.error("Không thể cập nhật số lượng");
                if (context?.previousCart) {
                    queryClient.setQueryData(["cart", userId], context.previousCart);
                }
            },

            onSettled: () => {
                queryClient.invalidateQueries(["cart", userId]);
            },
        }
    );

// ✅ Hàm xử lý khi người dùng bấm cộng/trừ
    const handleUpdateQuantity = (bookId, quantityChange) => {
        // quantityChange: +1 hoặc -1
        updateQuantityMutation.mutate({ bookId, quantity: quantityChange });
    };

    const handleRemove = (bookId) => {
        setItemToRemove(bookId);
        setIsConfirmDialogOpen(true);
    };

    const confirmRemove = () => {
        if (itemToRemove) {
            removeMutation.mutate({
                userId: Number(userId),
                bookId: Number(itemToRemove),
            });
        }
        setIsConfirmDialogOpen(false);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }
        navigate("/customer/checkout");
    };

    // Process cart data
    const cartResponse = cartData?.data || cartData;
    const cartItems = cartResponse?.cartItems || [];
    const totalPrice = cartResponse?.totalPrice || 0;
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Group items by seller
    const groupedBySeller = cartItems.reduce((acc, item) => {
        const storeName = item.storeName || "Unknown Seller";
        if (!acc[storeName]) {
            acc[storeName] = [];
        }
        acc[storeName].push(item);
        return acc;
    }, {});

    // Get recommended books (excluding items in cart)
    const allBooks = Array.isArray(allBooksData?.data) ? allBooksData.data : Array.isArray(allBooksData) ? allBooksData : [];
    const cartBookIds = new Set(cartItems.map(item => item.bookId));
    const recommendedBooks = allBooks
        .filter(book => !cartBookIds.has(book.id) && book.active)
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 4);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Skeleton className="h-10 w-64 mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {[1, 2, 3].map(i => (
                                <Card key={i}>
                                    <CardContent className="p-6">
                                        <Skeleton className="h-24 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div>
                            <Card>
                                <CardContent className="p-6">
                                    <Skeleton className="h-40 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4" />
                        <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Giỏ hàng</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
                                <p className="text-muted-foreground">
                                    {cartCount > 0 ? `${cartCount} sản phẩm` : "Chưa có sản phẩm nào"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {cartItems.length === 0 ? (
                        // Empty Cart State
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="border-2 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                                        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Giỏ hàng trống</h3>
                                    <p className="text-muted-foreground mb-6 max-w-md">
                                        Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm những cuốn sách yêu thích c���a bạn!
                                    </p>
                                    <Button size="lg" className="gap-2" onClick={() => navigate("/")}>
                                        <ShoppingBag className="w-5 h-5" />
                                        Khám phá sách ngay
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        // Cart with Items
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-6">
                                <AnimatePresence mode="popLayout">
                                    {Object.entries(groupedBySeller).map(([storeName, items]) => (
                                        <motion.div
                                            key={storeName}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Card className="border-2 overflow-hidden">
                                                {/* Seller Header */}
                                                <CardHeader className="bg-muted/50 border-b">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2">
                                                            <AvatarImage src="" alt={storeName} />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                                {storeName.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex items-center gap-2">
                                                            <Store className="w-4 h-4 text-primary" />
                                                            <h3 className="font-semibold">{storeName}</h3>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {items.length} sản phẩm
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                {/* Items List */}
                                                <CardContent className="p-0">
                                                    <AnimatePresence mode="popLayout">
                                                        {items.map((item, index) => {
                                                            const isRemoving = removingItems.has(item.bookId);
                                                            return (
                                                                <motion.div
                                                                    key={item.bookId}
                                                                    layout
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: isRemoving ? 0.5 : 1 }}
                                                                    exit={{ opacity: 0, x: -100 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <div className="p-6">
                                                                        <div className="flex gap-4">
                                                                            {/* Book Image */}
                                                                            <div
                                                                                className="relative flex-shrink-0 cursor-pointer group"
                                                                                onClick={() => navigate(`/books/${item.bookId}`)}
                                                                            >
                                                                                <img
                                                                                    src={item.imgUrl || "https://via.placeholder.com/100x140"}
                                                                                    alt={item.bookName}
                                                                                    className="w-24 h-32 object-cover rounded-lg border-2 group-hover:border-primary transition-all"
                                                                                />
                                                                            </div>

                                                                            {/* Book Details */}
                                                                            <div className="flex-1 min-w-0">
                                                                                <h4
                                                                                    className="text-lg font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                                                                                    onClick={() => navigate(`/books/${item.bookId}`)}
                                                                                >
                                                                                    {item.bookName}
                                                                                </h4>

                                                                                <div className="flex items-center gap-4 mb-4">
                                                                                    <div className="text-sm text-muted-foreground">
                                                                                        Đơn giá: <span className="font-semibold text-foreground">
                                                                                            {item.price.toLocaleString("vi-VN")}₫
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center justify-between">
                                                                                    {/* Quantity Controls */}
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-sm text-muted-foreground mr-2">Số lượng:</span>
                                                                                        <div className="flex items-center border-2 rounded-lg">
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                className="h-8 w-8 p-0 hover:bg-muted"
                                                                                                onClick={() => handleUpdateQuantity(item.bookId, -1)}
                                                                                                disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                                                                                            >
                                                                                                <Minus className="w-4 h-4" />
                                                                                            </Button>
                                                                                            <div className="w-12 text-center font-semibold">
                                                                                                {item.quantity}
                                                                                            </div>
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                className="h-8 w-8 p-0 hover:bg-muted"
                                                                                                onClick={() => handleUpdateQuantity(item.bookId, 1)}
                                                                                                disabled={updateQuantityMutation.isPending}
                                                                                            >
                                                                                                <Plus className="w-4 h-4" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Item Total & Remove */}
                                                                                    <div className="flex items-center gap-4">
                                                                                        <div className="text-right">
                                                                                            <p className="text-sm text-muted-foreground mb-1">Thành tiền</p>
                                                                                            <p className="text-xl font-bold text-primary">
                                                                                                {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                                                                                            </p>
                                                                                        </div>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                                            onClick={() => handleRemove(item.bookId)}
                                                                                            disabled={isRemoving}
                                                                                        >
                                                                                            <Trash2 className="w-5 h-5" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {index < items.length - 1 && <Separator />}
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </AnimatePresence>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Continue Shopping */}
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => navigate("/")}
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                    Tiếp tục mua sắm
                                </Button>
                            </div>

                            {/* Order Summary - Sticky */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-4 space-y-4">
                                    {/* Summary Card */}
                                    <Card className="border-2">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Package className="w-5 h-5 text-primary" />
                                                Tóm tắt đơn hàng
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Tạm tính ({cartCount} sản phẩm)</span>
                                                    <span className="font-semibold">
                                                        {totalPrice.toLocaleString("vi-VN")}₫
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Phí vận chuyển</span>
                                                    <span className="font-semibold text-green-600">Miễn phí</span>
                                                </div>
                                                <Separator />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-semibold">Tổng cộng</span>
                                                    <motion.span
                                                        key={totalPrice}
                                                        initial={{ scale: 1.1, color: "#22c55e" }}
                                                        animate={{ scale: 1, color: "inherit" }}
                                                        transition={{ duration: 0.3 }}
                                                        className="text-2xl font-bold text-primary"
                                                    >
                                                        {totalPrice.toLocaleString("vi-VN")}₫
                                                    </motion.span>
                                                </div>
                                            </div>

                                            <Separator />

                                            <Button
                                                size="lg"
                                                className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:opacity-90"
                                                onClick={handleCheckout}
                                            >
                                                Thanh toán
                                                <ArrowRight className="w-5 h-5" />
                                            </Button>

                                            <Alert className="bg-primary/5 border-primary/20">
                                                <AlertCircle className="h-4 w-4 text-primary" />
                                                <AlertDescription className="text-xs">
                                                    Miễn phí vận chuyển cho đơn hàng từ 150.000₫
                                                </AlertDescription>
                                            </Alert>
                                        </CardContent>
                                    </Card>

                                    {/* Benefits Card */}
                                    <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-2">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Giao hàng nhanh</p>
                                                    <p className="text-xs text-muted-foreground">Nhận hàng trong 2-3 ngày</p>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Đảm bảo chất lượng</p>
                                                    <p className="text-xs text-muted-foreground">Sách chính hãng 100%</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </section>

            {/* Recommendations */}
            {recommendedBooks.length > 0 && (
                <MaybeYouLike relatedBooks={recommendedBooks} />
            )}

            <Footer />

            {/* Confirm Remove Dialog */}
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemove}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Xóa sản phẩm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
