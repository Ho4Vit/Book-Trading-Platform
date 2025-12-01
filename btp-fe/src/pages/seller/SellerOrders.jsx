import React, { useState } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { orderApi, paymentApi } from "@/api/index.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Search, Package, Eye, Truck, ArrowUpDown, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function SellerOrders() {
    const { userId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        orderId: null,
        newStatus: null,
        currentStatus: null
    });

    // Fetch seller's orders directly
    const { data: ordersData, isLoading } = useCustomQuery(
        ["seller-orders", userId],
        () => orderApi.getOrderBySellerId(userId),
        {
            enabled: !!userId,
        }
    );

    // Fetch all payments
    const { data: paymentsData } = useCustomQuery(
        ["all-payments"],
        () => paymentApi.getAllPayment()
    );

    const sellerOrders = Array.isArray(ordersData?.data)
        ? ordersData.data
        : Array.isArray(ordersData)
        ? ordersData
        : [];

    const allPayments = Array.isArray(paymentsData?.data)
        ? paymentsData.data
        : Array.isArray(paymentsData)
        ? paymentsData
        : [];

    // Create a map of payments by orderId
    const paymentMap = allPayments.reduce((map, payment) => {
        map[payment.orderId] = payment;
        return map;
    }, {});

    // Update order status mutation
    const updateStatusMutation = useCustomMutation(
        ({ orderId, status }) => orderApi.updateStatus(orderId, status),
        "PUT",
        {
            invalidateKeys: ["seller-orders"],
            onSuccess: () => {
                toast.success("Cập nhật trạng thái thành công!");
            },
        }
    );

    const confirmPaymentMutation = useCustomMutation(
        (paymentId) => paymentApi.confirmPayment(paymentId),
        "POST",
        {
            // Cần làm mới data payment để cập nhật trạng thái
            invalidateKeys: ["all-payments"],
            onSuccess: () => {
                toast.success("Đã xác nhận thanh toán COD!");
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể xác nhận thanh toán");
            }
        }
    );

    // Hàm xử lý sự kiện click xác nhận thanh toán
    const handleConfirmPayment = (paymentId) => {
        if (!paymentId) return;
        confirmPaymentMutation.mutate(paymentId);
    };

    // Helper kiểm tra điều kiện hiển thị nút (PENDING & COD & Payment PENDING)
    const canConfirmCOD = (order) => {
        const payment = paymentMap[order.id];
        return (
            order.status === "DELIVERED" &&          // Đơn hàng đang chờ xử lý
            payment &&                         // Có thông tin thanh toán
            payment.method === "COD" &&        // Là COD
            payment.status === "PENDING"       // Thanh toán chưa được xác nhận
        );
    };

    // Filter and sort orders
    const filteredOrders = sellerOrders
        .filter(order => {
            const matchesSearch = order.id?.toString().includes(searchQuery);
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "date-desc":
                    return new Date(b.orderDate) - new Date(a.orderDate);
                case "date-asc":
                    return new Date(a.orderDate) - new Date(b.orderDate);
                case "id-desc":
                    return b.id - a.id;
                case "id-asc":
                    return a.id - b.id;
                case "price-desc":
                    return (b.totalPrice || 0) - (a.totalPrice || 0);
                case "price-asc":
                    return (a.totalPrice || 0) - (b.totalPrice || 0);
                default:
                    return 0;
            }
        });

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsDetailDialogOpen(true);
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        const order = sellerOrders.find(o => o.id === orderId);
        setConfirmDialog({
            open: true,
            orderId,
            newStatus,
            currentStatus: order?.status
        });
    };

    const confirmUpdateStatus = () => {
        if (confirmDialog.orderId && confirmDialog.newStatus) {
            updateStatusMutation.mutate({
                orderId: confirmDialog.orderId,
                status: confirmDialog.newStatus
            });
            setConfirmDialog({ open: false, orderId: null, newStatus: null, currentStatus: null });
        }
    };

    const cancelUpdateStatus = () => {
        setConfirmDialog({ open: false, orderId: null, newStatus: null, currentStatus: null });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            "PENDING": { variant: "secondary", label: "Chờ xử lý" },
            "CONFIRMED": { variant: "default", label: "Đã xác nhận" },
            "SHIPPING": { variant: "outline", label: "Đang giao" },
            "DELIVERED": { variant: "success", label: "Đã giao" },
            "CANCELLED": { variant: "destructive", label: "Đã hủy" },
        };

        const config = statusConfig[status] || { variant: "secondary", label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const calculateOrderTotal = (order) => {
        // Use totalPrice from the order response, or calculate from cartItems if needed
        return order.totalPrice || order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    };

    // Check if order can be cancelled (PENDING status and over 24h from payment date)
    const canCancelOrder = (order) => {
        if (order.status !== "PENDING") return false;

        const payment = paymentMap[order.id];
        if (!payment || !payment.paymentDate) return false;

        const paymentDate = new Date(payment.paymentDate);
        const now = new Date();
        const hoursDiff = (now - paymentDate) / (1000 * 60 * 60); // Convert ms to hours

        return hoursDiff >= 24;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
                <p className="text-muted-foreground">
                    Xem và quản lý các đơn hàng chứa sách của bạn
                </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sellerOrders.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sellerOrders.filter(o => o.status === "PENDING").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sellerOrders.filter(o => o.status === "SHIPPING").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sellerOrders.filter(o => o.status === "DELIVERED").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo mã đơn hàng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Lọc trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                        <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                        <SelectItem value="SHIPPING">Đang giao</SelectItem>
                        <SelectItem value="DELIVERED">Đã giao</SelectItem>
                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px]">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date-desc">Ngày mới nhất</SelectItem>
                        <SelectItem value="date-asc">Ngày cũ nhất</SelectItem>
                        <SelectItem value="id-desc">Mã đơn giảm dần</SelectItem>
                        <SelectItem value="id-asc">Mã đơn tăng dần</SelectItem>
                        <SelectItem value="price-desc">Giá cao nhất</SelectItem>
                        <SelectItem value="price-asc">Giá thấp nhất</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đơn hàng</CardTitle>
                    <CardDescription>
                        {filteredOrders.length} đơn hàng
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã đơn</TableHead>
                                        <TableHead>Ngày đặt</TableHead>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Tổng tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                #{order.id}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                                            </TableCell>
                                            <TableCell>
                                                {order.cartItems?.length || 0} sản phẩm
                                            </TableCell>
                                            <TableCell>
                                                {calculateOrderTotal(order).toLocaleString()}đ
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(order.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Xem
                                                    </Button>
                                                    {order.status === "PENDING" && !canCancelOrder(order) && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            <Package className="h-4 w-4 mr-1" />
                                                            Xác nhận
                                                        </Button>
                                                    )}
                                                    {order.status === "PENDING" && canCancelOrder(order) && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            Hủy đơn
                                                        </Button>
                                                    )}
                                                    {order.status === "CONFIRMED" && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(order.id, "SHIPPING")}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            <Truck className="h-4 w-4 mr-1" />
                                                            Giao hàng
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "Không tìm thấy đơn hàng nào" : "Chưa có đơn hàng nào"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            Thông tin chi tiết về đơn hàng
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày đặt</p>
                                    <p className="font-medium">
                                        {new Date(selectedOrder.orderDate).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                                </div>
                                {selectedOrder.transactionId && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Mã giao dịch</p>
                                        <p className="font-medium">{selectedOrder.transactionId}</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Info */}
                            {paymentMap[selectedOrder.id] && (
                                <div>
                                    <h4 className="font-semibold mb-2">Thông tin thanh toán</h4>
                                    <div className="p-4 border rounded-lg space-y-2">
                                        <p>
                                            <span className="text-muted-foreground">Phương thức:</span>{" "}
                                            <Badge variant="outline">
                                                {paymentMap[selectedOrder.id].method === "COD" ? "Tiền mặt" : paymentMap[selectedOrder.id].method}
                                            </Badge>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Trạng thái:</span>{" "}
                                            <Badge variant={paymentMap[selectedOrder.id].status === "SUCCESS" ? "success" : "secondary"}>
                                                {paymentMap[selectedOrder.id].status === "SUCCESS" ? "Thành công" : paymentMap[selectedOrder.id].status === "PENDING" ? "Đang chờ" : "Thất bại"}
                                            </Badge>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Số tiền:</span>{" "}
                                            {paymentMap[selectedOrder.id].amount.toLocaleString()}đ
                                        </p>
                                        {paymentMap[selectedOrder.id].paymentDate && (
                                            <p>
                                                <span className="text-muted-foreground">Ngày thanh toán:</span>{" "}
                                                {new Date(paymentMap[selectedOrder.id].paymentDate).toLocaleString("vi-VN")}
                                            </p>
                                        )}
                                        {canCancelOrder(selectedOrder) && (
                                            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                                <p className="text-sm text-destructive font-medium">
                                                    ⚠️ Đơn hàng đã quá 24 giờ chưa được xác nhận. Bạn có thể hủy đơn hàng này.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Customer Info */}
                            <div>
                                <h4 className="font-semibold mb-2">Thông tin khách hàng</h4>
                                <div className="p-4 border rounded-lg space-y-2">
                                    <p><span className="text-muted-foreground">Mã KH:</span> {selectedOrder.customerId}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-semibold mb-2">Sản phẩm</h4>
                                <div className="border rounded-lg divide-y">
                                    {selectedOrder.cartItems?.map((item, index) => (
                                        <div key={index} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.coverImage || "https://via.placeholder.com/60"}
                                                    alt={item.bookTitle}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium">{item.bookTitle || `Book #${item.bookId}`}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        SL: {item.quantity} × {item.bookPrice.toLocaleString()}đ
                                                    </p>
                                                    {item.discountAmount !== 0 && (
                                                        <p className="text-sm text-green-600">
                                                            Giảm: {item.discountAmount.toLocaleString()}đ (Code: {item.discountCode})
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="font-semibold">
                                                {(item.totalAmount).toLocaleString()}đ
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <span className="font-semibold">Tổng cộng:</span>
                                <span className="text-xl font-bold text-primary">
                                    {calculateOrderTotal(selectedOrder).toLocaleString()}đ
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 justify-end">
                                {selectedOrder && canConfirmCOD(selectedOrder) && (
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleConfirmPayment(paymentMap[selectedOrder.id].id)}
                                        disabled={confirmPaymentMutation.isPending}
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Xác nhận thanh toán COD
                                    </Button>
                                )}
                                {selectedOrder.status === "PENDING" && !canCancelOrder(selectedOrder) && (
                                    <Button
                                        onClick={() => {
                                            handleUpdateStatus(selectedOrder.id, "CONFIRMED");
                                            setIsDetailDialogOpen(false);
                                        }}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Xác nhận đơn hàng
                                    </Button>
                                )}
                                {selectedOrder.status === "PENDING" && canCancelOrder(selectedOrder) && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                handleUpdateStatus(selectedOrder.id, "CONFIRMED");
                                                setIsDetailDialogOpen(false);
                                            }}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            <Package className="h-4 w-4 mr-2" />
                                            Xác nhận đơn hàng
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                handleUpdateStatus(selectedOrder.id, "CANCELLED");
                                                setIsDetailDialogOpen(false);
                                            }}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            Hủy đơn hàng
                                        </Button>
                                    </>
                                )}
                                {selectedOrder.status === "CONFIRMED" && (
                                    <Button
                                        onClick={() => {
                                            handleUpdateStatus(selectedOrder.id, "SHIPPING");
                                            setIsDetailDialogOpen(false);
                                        }}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        <Truck className="h-4 w-4 mr-2" />
                                        Giao hàng
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Status Change Confirmation Dialog */}
            <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && cancelUpdateStatus()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận thay đổi trạng thái</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng #{confirmDialog.orderId}?
                            <div className="mt-4 p-3 bg-muted rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Trạng thái hiện tại:</span>
                                    {getStatusBadge(confirmDialog.currentStatus)}
                                </div>
                                <div className="flex items-center justify-center">
                                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Trạng thái mới:</span>
                                    {getStatusBadge(confirmDialog.newStatus)}
                                </div>
                            </div>
                            {confirmDialog.newStatus === "CANCELLED" && (
                                <p className="mt-3 text-sm text-destructive font-medium">
                                    ⚠️ Hành động này sẽ hủy đơn hàng và không thể hoàn tác.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelUpdateStatus}>
                            Hủy bỏ
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmUpdateStatus}
                            className={confirmDialog.newStatus === "CANCELLED" ? "bg-destructive hover:bg-destructive/90" : ""}
                        >
                            Xác nhận
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
