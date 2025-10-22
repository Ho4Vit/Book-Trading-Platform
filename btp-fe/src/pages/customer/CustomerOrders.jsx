import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FeedbackDialog from "@/components/FeedbackDialog";
import { orderApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import {
    Package,
    Search,
    ShoppingBag,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    Calendar,
    DollarSign,
    Eye,
    Home,
    Star,
    MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const statusConfig = {
    PENDING: {
        label: "Chờ xác nhận",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
    },
    CONFIRMED: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle2,
    },
    SHIPPING: {
        label: "Đang giao",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Truck,
    },
    DELIVERED: {
        label: "Đã giao",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
    },
};

export default function CustomerOrders() {
    const navigate = useNavigate();
    const { userId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("newest");
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    // Fetch customer orders
    const { data: ordersData, isLoading } = useCustomQuery(
        ["customerOrders", userId],
        () => orderApi.getOrdersByCustomerId(userId),
        {
            enabled: !!userId,
            refetchInterval: 30000, // Refetch every 30 seconds
        }
    );

    // Process orders data
    const orders = useMemo(() => {
        return Array.isArray(ordersData?.data)
            ? ordersData.data
            : Array.isArray(ordersData)
            ? ordersData
            : [];
    }, [ordersData]);

    // Filter and sort orders
    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        // Filter by status
        if (statusFilter !== "ALL") {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter((order) => {
                const query = searchQuery.toLowerCase();
                return (
                    order.id?.toString().includes(query) ||
                    order.cartItems?.some((item) =>
                        item.bookName?.toLowerCase().includes(query)
                    )
                );
            });
        }

        // Sort orders
        switch (sortBy) {
            case "newest":
                filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                break;
            case "oldest":
                filtered.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
                break;
            case "price-high":
                filtered.sort((a, b) => b.totalPrice - a.totalPrice);
                break;
            case "price-low":
                filtered.sort((a, b) => a.totalPrice - b.totalPrice);
                break;
            default:
                break;
        }

        return filtered;
    }, [orders, statusFilter, searchQuery, sortBy]);

    // Count orders by status
    const orderCounts = useMemo(() => {
        return {
            ALL: orders.length,
            PENDING: orders.filter((o) => o.status === "PENDING").length,
            CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
            SHIPPING: orders.filter((o) => o.status === "SHIPPING").length,
            DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
            CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
        };
    }, [orders]);

    const handleViewOrderDetail = (orderId) => {
        // Navigate to order detail page (you can create this later)
        console.log("View order detail:", orderId);
    };

    const handleOpenFeedbackDialog = (order, book) => {
        setSelectedBook({
            bookId: book.bookId,
            bookName: book.bookName,
        });
        setFeedbackDialogOpen(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
        } catch {
            return dateString;
        }
    };

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Đơn hàng của tôi</h1>
                        <p className="text-muted-foreground">
                            Quản lý và theo dõi đơn hàng của bạn
                        </p>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Home className="w-4 h-4" />
                            Trang chủ
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4" />
                            Đơn hàng của tôi
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Filters & Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sách..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Mới nhất</SelectItem>
                                <SelectItem value="oldest">Cũ nhất</SelectItem>
                                <SelectItem value="price-high">Giá cao nhất</SelectItem>
                                <SelectItem value="price-low">Giá thấp nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Status Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
                    <TabsTrigger value="ALL" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3">
                        <span>Tất cả</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                            {orderCounts.ALL}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="PENDING" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3">
                        <span className="hidden sm:inline">Chờ xác nhận</span>
                        <span className="sm:hidden">Chờ</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                            {orderCounts.PENDING}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="CONFIRMED" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3">
                        <span className="hidden sm:inline">Đã xác nhận</span>
                        <span className="sm:hidden">Xác nhận</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                            {orderCounts.CONFIRMED}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="SHIPPING" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3">
                        <span className="hidden sm:inline">Đang giao</span>
                        <span className="sm:hidden">Giao</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                            {orderCounts.SHIPPING}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="DELIVERED" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3">
                        <span className="hidden sm:inline">Đã giao</span>
                        <span className="sm:hidden">Hoàn tất</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                            {orderCounts.DELIVERED}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="CANCELLED" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3">
                        <span className="hidden sm:inline">Đã hủy</span>
                        <span className="sm:hidden">Hủy</span>
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5">
                            {orderCounts.CANCELLED}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={statusFilter} className="mt-6">
                    {filteredOrders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Package className="w-20 h-20 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    {searchQuery
                                        ? "Không tìm thấy đơn hàng"
                                        : "Chưa có đơn hàng nào"}
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {searchQuery
                                        ? "Thử tìm kiếm với từ khóa khác"
                                        : "Hãy đặt hàng ngay để trải nghiệm dịch vụ của chúng tôi"}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={() => navigate("/")}>
                                        Khám phá sản phẩm
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => {
                                const StatusIcon = statusConfig[order.status]?.icon || Package;
                                return (
                                    <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <StatusIcon className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">
                                                                Đơn hàng #{order.id}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatDate(order.orderDate)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={`${
                                                        statusConfig[order.status]?.color
                                                    } border`}
                                                >
                                                    {statusConfig[order.status]?.label || order.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            {/* Order Items */}
                                            <div className="space-y-3 mb-4">
                                                {order.cartItems?.map((item) => (
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
                                                            className="w-16 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => navigate(`/books/${item.bookId}`)}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4
                                                                className="font-medium line-clamp-1 mb-1 cursor-pointer hover:text-primary transition-colors"
                                                                onClick={() => navigate(`/books/${item.bookId}`)}
                                                            >
                                                                {item.bookName}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground mb-1">
                                                                {item.storeName}
                                                            </p>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-muted-foreground">
                                                                    x{item.quantity}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-primary">
                                                                        {(item.price * item.quantity).toLocaleString(
                                                                            "vi-VN"
                                                                        )}
                                                                        ₫
                                                                    </span>
                                                                    {order.status === "DELIVERED" && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="gap-1 h-7 text-xs"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleOpenFeedbackDialog(order, item);
                                                                            }}
                                                                        >
                                                                            <Star className="w-3 h-3" />
                                                                            Đánh giá
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <Separator className="my-4" />

                                            {/* Order Summary */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>
                                                        {order.cartItems?.reduce(
                                                            (acc, item) => acc + item.quantity,
                                                            0
                                                        )}{" "}
                                                        sản phẩm
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-sm text-muted-foreground">
                                                            Tổng tiền
                                                        </p>
                                                        <p className="text-xl font-bold text-primary">
                                                            {order.totalPrice.toLocaleString("vi-VN")}₫
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => handleViewOrderDetail(order.id)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Chi tiết
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => handleOpenFeedbackDialog(order)}
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Phản hồi
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Summary Stats */}
            {orders.length > 0 && (
                <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
                                    <p className="text-2xl font-bold">{orders.length}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Đã giao</p>
                                    <p className="text-2xl font-bold">{orderCounts.DELIVERED}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tổng chi tiêu</p>
                                    <p className="text-2xl font-bold">
                                        {orders
                                            .filter((o) => o.status === "DELIVERED")
                                            .reduce((acc, order) => acc + order.totalPrice, 0)
                                            .toLocaleString("vi-VN")}
                                        ₫
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Feedback Dialog */}
            <FeedbackDialog
                open={feedbackDialogOpen}
                onOpenChange={setFeedbackDialogOpen}
                book={selectedBook}
            />
        </div>
    );
}
