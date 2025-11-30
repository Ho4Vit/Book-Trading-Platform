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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import FeedbackDialog from "@/components/FeedbackDialog";
import { orderApi, paymentApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
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
    Ban,
    CreditCard,
    MapPin,
    Phone,
    Mail,
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
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [confirmReceivedDialogOpen, setConfirmReceivedDialogOpen] = useState(false);
    const [orderToConfirm, setOrderToConfirm] = useState(null);

    // Fetch customer orders
    const { data: ordersData, isLoading, refetch } = useCustomQuery(
        ["customerOrders", userId],
        () => orderApi.getOrdersByCustomerId(userId),
        {
            enabled: !!userId,
            refetchInterval: 30000, // Refetch every 30 seconds
        }
    );

    // Fetch all payments
    const { data: paymentsData } = useCustomQuery(
        ["allPayments"],
        () => paymentApi.getAllPayment(),
        {
            refetchInterval: 30000, // Refetch every 30 seconds
        }
    );

    // Cancel order mutation
    const cancelOrderMutation = useCustomMutation(
        (orderId) => orderApi.cancelOrder(orderId),
        null,
        {
            onSuccess: () => {
                refetch();
                setCancelDialogOpen(false);
                setOrderToCancel(null);
            },
        }
    );

    const updateStatusMutation = useCustomMutation(
        ({ orderId, status }) => orderApi.updateStatus(orderId, status),
        null,
        {
            onSuccess: () => {
                refetch();
                setConfirmReceivedDialogOpen(false);
                setOrderToConfirm(null);
                // Optional: You could open the feedback dialog here immediately after success
                // setFeedbackDialogOpen(true);
            },
        }
    );

    const handleOpenConfirmReceived = (order) => {
        setOrderToConfirm(order);
        setConfirmReceivedDialogOpen(true);
    };

    const handleConfirmReceived = () => {
        if (orderToConfirm) {
            updateStatusMutation.mutate({
                orderId: orderToConfirm.id,
                status: "DELIVERED"
            });
        }
    };

    // Process orders data
    const orders = useMemo(() => {
        return Array.isArray(ordersData?.data)
            ? ordersData.data
            : Array.isArray(ordersData)
            ? ordersData
            : [];
    }, [ordersData]);

    // Process payments data and create a mapping from orderId to payment
    const paymentsMap = useMemo(() => {
        const payments = Array.isArray(paymentsData?.data)
            ? paymentsData.data
            : Array.isArray(paymentsData)
            ? paymentsData
            : [];

        const map = new Map();
        payments.forEach((payment) => {
            map.set(payment.orderId, payment);
        });
        return map;
    }, [paymentsData]);

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
        const order = orders.find(o => o.id === orderId);
        const payment = paymentsMap.get(orderId);

        if (order) {
            setSelectedOrderDetail({
                ...order,
                payment: payment || null
            });
            setOrderDetailDialogOpen(true);
        }
    };

    const handleOpenCancelDialog = (order) => {
        setOrderToCancel(order);
        setCancelDialogOpen(true);
    };

    const handleConfirmCancel = () => {
        if (orderToCancel) {
            cancelOrderMutation.mutate(orderToCancel.id);
        }
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
                                                    {order.status === "PENDING" && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="gap-2"
                                                            onClick={() => handleOpenCancelDialog(order)}
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                            Hủy đơn
                                                        </Button>
                                                    )}
                                                    {order.status === "SHIPPING" && (
                                                        <Button
                                                            variant="default" // Changed to default (solid) to make it prominent
                                                            size="sm"
                                                            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent card click
                                                                handleOpenConfirmReceived(order);
                                                            }}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Đã nhận hàng
                                                        </Button>
                                                    )}
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


            {/* Order Detail Dialog */}
            <Dialog open={orderDetailDialogOpen} onOpenChange={setOrderDetailDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <Package className="w-6 h-6 text-primary" />
                            Chi tiết đơn hàng #{selectedOrderDetail?.id}
                        </DialogTitle>
                        <DialogDescription>
                            Thông tin chi tiết về đơn hàng và thanh toán
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrderDetail && (
                        <div className="space-y-6">
                            {/* Order Status */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Trạng thái đơn hàng</h3>
                                        <Badge
                                            className={`${
                                                statusConfig[selectedOrderDetail.status]?.color
                                            } border`}
                                        >
                                            {statusConfig[selectedOrderDetail.status]?.label || selectedOrderDetail.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Ngày đặt:</span>
                                            <span className="font-medium">{formatDate(selectedOrderDetail.orderDate)}</span>
                                        </div>
                                        {selectedOrderDetail.transactionId && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">Mã giao dịch:</span>
                                                <span className="font-medium">{selectedOrderDetail.transactionId}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Information */}
                            {selectedOrderDetail.payment && (
                                <Card className="border-primary/20">
                                    <CardHeader className="bg-primary/5">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-primary" />
                                            Thông tin thanh toán
                                        </h3>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                                                <p className="font-semibold flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" />
                                                    {selectedOrderDetail.payment.method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : selectedOrderDetail.payment.method}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Trạng thái thanh toán</p>
                                                <Badge
                                                    className={
                                                        selectedOrderDetail.payment.status === 'SUCCESS'
                                                            ? 'bg-green-100 text-green-800 border-green-200'
                                                            : selectedOrderDetail.payment.status === 'PENDING'
                                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                            : 'bg-red-100 text-red-800 border-red-200'
                                                    }
                                                >
                                                    {selectedOrderDetail.payment.status === 'SUCCESS' ? 'Thành công' :
                                                     selectedOrderDetail.payment.status === 'PENDING' ? 'Chờ thanh toán' :
                                                     'Thất bại'}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Số tiền thanh toán</p>
                                                <p className="font-bold text-lg text-primary">
                                                    {selectedOrderDetail.payment.amount.toLocaleString("vi-VN")}₫
                                                </p>
                                            </div>
                                            {selectedOrderDetail.payment.paymentDate && (
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">Ngày thanh toán</p>
                                                    <p className="font-medium">{formatDate(selectedOrderDetail.payment.paymentDate)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">Sản phẩm đã đặt</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {selectedOrderDetail.cartItems?.map((item, index) => (
                                            <div key={item.bookId} className="flex gap-4 pb-4 border-b last:border-0">
                                                <img
                                                    src={item.imgUrl || "https://via.placeholder.com/80x100"}
                                                    alt={item.bookName}
                                                    className="w-20 h-24 object-cover rounded border"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <h4 className="font-semibold line-clamp-2">{item.bookName}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <ShoppingBag className="w-3 h-3" />
                                                        <span>{item.storeName}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">
                                                            Số lượng: {item.quantity}
                                                        </span>
                                                        <div className="text-right">
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.price.toLocaleString("vi-VN")}₫ x {item.quantity}
                                                            </p>
                                                            <p className="font-semibold text-primary">
                                                                {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Summary */}
                            <Card className="bg-muted/30">
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tạm tính</span>
                                            <span className="font-medium">
                                                {selectedOrderDetail.totalPrice.toLocaleString("vi-VN")}₫
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Phí vận chuyển</span>
                                            <span className="font-medium text-green-600">Miễn phí</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-lg">Tổng cộng</span>
                                            <span className="font-bold text-xl text-primary">
                                                {selectedOrderDetail.totalPrice.toLocaleString("vi-VN")}₫
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3">
                                {selectedOrderDetail.status === "PENDING" && (
                                    <Button
                                        variant="destructive"
                                        className="gap-2"
                                        onClick={() => {
                                            setOrderDetailDialogOpen(false);
                                            handleOpenCancelDialog(selectedOrderDetail);
                                        }}
                                    >
                                        <Ban className="w-4 h-4" />
                                        Hủy đơn hàng
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => setOrderDetailDialogOpen(false)}
                                >
                                    Đóng
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirm Received Dialog */}
            <AlertDialog open={confirmReceivedDialogOpen} onOpenChange={setConfirmReceivedDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận đã nhận hàng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn xác nhận đã nhận được đơn hàng #{orderToConfirm?.id} và kiện hàng còn nguyên vẹn?
                            <br />
                            Sau khi xác nhận, trạng thái đơn hàng sẽ chuyển sang "Đã giao".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Chưa nhận được</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmReceived}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Đã nhận hàng
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Order Confirmation Dialog */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn hủy đơn hàng #{orderToCancel?.id}?
                            <br />
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Không, giữ đơn hàng</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmCancel}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Có, hủy đơn hàng
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Feedback Dialog */}
            <FeedbackDialog
                open={feedbackDialogOpen}
                onOpenChange={setFeedbackDialogOpen}
                book={selectedBook}
            />
        </div>
    );
}
