import React, { useState } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { bookApi, orderApi } from "@/api/index.js";
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
import { Search, Package, Eye, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function SellerOrders() {
    const { userId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    // Fetch seller's books
    const { data: sellerBooks } = useCustomQuery(
        ["seller-books", userId],
        () => bookApi.getBookBySeller(userId),
        {
            enabled: !!userId,
        }
    );

    const books = sellerBooks || [];

    // Fetch all orders
    const { data: allOrders, isLoading } = useCustomQuery(
        ["seller-orders"],
        orderApi.getAllOrders
    );

    // Filter orders that contain seller's books
    const sellerOrders = allOrders?.filter(order =>
        order.items?.some(item =>
            books.some(book => book.id === item.bookId)
        )
    ).map(order => ({
        ...order,
        items: order.items?.filter(item =>
            books.some(book => book.id === item.bookId)
        )
    })) || [];

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

    // Filter orders
    const filteredOrders = sellerOrders.filter(order => {
        const matchesSearch = order.orderId?.toString().includes(searchQuery);
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsDetailDialogOpen(true);
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        updateStatusMutation.mutate({ orderId, status: newStatus });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            "Pending": { variant: "secondary", label: "Chờ xử lý" },
            "Processing": { variant: "default", label: "Đang xử lý" },
            "Shipped": { variant: "outline", label: "Đang giao" },
            "Delivered": { variant: "success", label: "Đã giao" },
            "Cancelled": { variant: "destructive", label: "Đã hủy" },
        };

        const config = statusConfig[status] || { variant: "secondary", label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const calculateOrderTotal = (order) => {
        return order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
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
                            {sellerOrders.filter(o => o.status === "Pending").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sellerOrders.filter(o => o.status === "Shipped").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sellerOrders.filter(o => o.status === "Delivered").length}
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
                        <SelectItem value="Pending">Chờ xử lý</SelectItem>
                        <SelectItem value="Processing">Đang xử lý</SelectItem>
                        <SelectItem value="Shipped">Đang giao</SelectItem>
                        <SelectItem value="Delivered">Đã giao</SelectItem>
                        <SelectItem value="Cancelled">Đã hủy</SelectItem>
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
                                        <TableRow key={order.orderId}>
                                            <TableCell className="font-medium">
                                                #{order.orderId}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                                            </TableCell>
                                            <TableCell>
                                                {order.items?.length || 0} sản phẩm
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
                                                    {order.status === "Pending" && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(order.orderId, "Processing")}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            <Package className="h-4 w-4 mr-1" />
                                                            Xử lý
                                                        </Button>
                                                    )}
                                                    {order.status === "Processing" && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(order.orderId, "Shipped")}
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
                        <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.orderId}</DialogTitle>
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
                                        {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Trạng thái</p>
                                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h4 className="font-semibold mb-2">Thông tin khách hàng</h4>
                                <div className="p-4 border rounded-lg space-y-2">
                                    <p><span className="text-muted-foreground">Mã KH:</span> {selectedOrder.customerId}</p>
                                    {selectedOrder.shippingAddress && (
                                        <p><span className="text-muted-foreground">Địa chỉ:</span> {selectedOrder.shippingAddress}</p>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-semibold mb-2">Sản phẩm</h4>
                                <div className="border rounded-lg divide-y">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.imgUrl || "https://via.placeholder.com/60"}
                                                    alt={item.bookName}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium">{item.bookName || `Book #${item.bookId}`}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        SL: {item.quantity} × {item.price.toLocaleString()}đ
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">
                                                {(item.price * item.quantity).toLocaleString()}đ
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
                                {selectedOrder.status === "Pending" && (
                                    <Button
                                        onClick={() => {
                                            handleUpdateStatus(selectedOrder.orderId, "Processing");
                                            setIsDetailDialogOpen(false);
                                        }}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Xử lý đơn hàng
                                    </Button>
                                )}
                                {selectedOrder.status === "Processing" && (
                                    <Button
                                        onClick={() => {
                                            handleUpdateStatus(selectedOrder.orderId, "Shipped");
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
        </div>
    );
}
