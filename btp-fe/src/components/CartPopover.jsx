import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { ShoppingCart, X, ShoppingBag } from "lucide-react";
import { cartApi } from "@/api/cartApi";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

export default function CartPopover() {
    const navigate = useNavigate();
    const { userId: rawUserId, role } = useAuthStore();
    const userId = rawUserId || "";
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    // Only fetch cart data if user is a customer
    const isCustomer = role === "CUSTOMER";

    // Fetch cart data
    const { data: cartData, isLoading } = useCustomQuery(
        ["cart", userId],
        () => cartApi.getCartByCustomerId(userId),
        {
            enabled: !!userId && isCustomer, // Only fetch if user is a customer
            refetchOnWindowFocus: true,
        }
    );

    // Remove from cart mutation
    const removeMutation = useCustomMutation(
        ({ bookId }) => cartApi.removeFromCart(userId, bookId),
        null,
        {
            onSuccess: () => {
                toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
                queryClient.invalidateQueries(["cart", userId]);
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể xóa sản phẩm");
            },
        }
    );

    const handleRemove = (item) => {
        setItemToRemove(item);
        setIsConfirmDialogOpen(true);
    };

    const confirmRemove = () => {
        if (itemToRemove) {
            removeMutation.mutate({ userId, bookId: itemToRemove.bookId });
            setIsConfirmDialogOpen(false);
            setItemToRemove(null);
        }
    };

    const cancelRemove = () => {
        setIsConfirmDialogOpen(false);
        setItemToRemove(null);
    };

    // Access cart data - handle both possible response structures
    const cartResponse = cartData?.data || cartData;
    const cartItems = cartResponse?.cartItems || [];
    const totalPrice = cartResponse?.totalPrice || 0;
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleViewCart = () => {
        setIsOpen(false);
        navigate("/customer/cart");
    };

    const handleCheckout = () => {
        setIsOpen(false);
        navigate("/customer/checkout");
    };

    // Don't render cart for non-customers
    if (!isCustomer) {
        return null;
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    <AnimatePresence>
                        {cartCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-background">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </Badge>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-96 p-0 shadow-xl border rounded-lg overflow-hidden" align="end">
                <div className="p-4 pb-0 border-b">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Giỏ hàng của bạn
                        </h4>
                        {cartCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {cartCount} sản phẩm
                            </Badge>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-80 px-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground font-medium mb-1">
                                Giỏ hàng trống
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Hãy thêm sản phẩm vào giỏ hàng nhé!
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {cartItems.map((item, index) => (
                                <motion.div
                                    key={item.bookId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    layout
                                >
                                    <div className="py-3">
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <img
                                                    src={item.imgUrl || "https://via.placeholder.com/60"}
                                                    alt={item.bookName}
                                                    className="w-14 h-14 rounded-md object-cover border"
                                                />
                                                <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                                    {item.quantity}
                                                </Badge>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium leading-tight mb-1 line-clamp-2">
                                                    {item.bookName}
                                                </p>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    Store: {item.storeName}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.quantity} × {item.price.toLocaleString()} đ
                                                    </p>
                                                    <p className="text-sm font-semibold text-primary">
                                                        {(item.price * item.quantity).toLocaleString()} đ
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemove(item)}
                                                disabled={removeMutation.isPending}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {index < cartItems.length - 1 && <Separator />}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </ScrollArea>

                {cartItems.length > 0 && (
                    <div className="p-4 border-t bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Tổng cộng:</span>
                            <motion.span
                                key={totalPrice}
                                initial={{ scale: 1.2, color: "#22c55e" }}
                                animate={{ scale: 1, color: "inherit" }}
                                transition={{ duration: 0.3 }}
                                className="text-lg font-bold text-primary"
                            >
                                {totalPrice.toLocaleString()} đ
                            </motion.span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleViewCart}
                            >
                                Xem giỏ hàng
                            </Button>
                            <Button
                                className="flex-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:opacity-90"
                                onClick={handleCheckout}
                            >
                                Thanh toán
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>

            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelRemove}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRemove}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Xóa sản phẩm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Popover>
    );
}
