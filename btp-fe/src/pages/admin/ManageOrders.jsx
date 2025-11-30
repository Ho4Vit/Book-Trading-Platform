import React, { useState } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { orderApi } from "@/api/index.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    DialogFooter,
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
import { Label } from "@/components/ui/label";
import { ShoppingCart, Search, Eye, Package, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageOrders() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState("");

    // Fetch data
    const { data: orders, isLoading, refetch } = useCustomQuery(
        ["admin-orders"],
        orderApi.getAllOrders
    );

    // Mutation
    const updateStatusMutation = useCustomMutation(
        (data) => orderApi.updateStatus(selectedOrder.id, data),
        null,
        {
            onSuccess: () => {
                toast.success("Cập nhật trạng thái đơn hàng thành công!");
                setIsStatusDialogOpen(false);
                setSelectedOrder(null);
                refetch();
            },
        }
    );

    // Filter orders
    const filteredOrders = orders?.filter(
        (order) =>
            order.orderId?.toString().includes(searchQuery) ||
            order.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleView = (order) => {
        setSelectedOrder(order);
        setIsViewDialogOpen(true);
    };

    const handleChangeStatus = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status || "PENDING");
        setIsStatusDialogOpen(true);
    };

    const handleUpdateStatus = () => {
        updateStatusMutation.mutate(newStatus);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: { label: "Chờ xử lý", variant: "secondary" },
            PROCESSING: { label: "Đang xử lý", variant: "default" },
            SHIPPING: { label: "Đang giao", variant: "default" },
            DELIVERED: { label: "Đã giao", variant: "default" },
            CANCELLED: { label: "Đã hủy", variant: "destructive" },
        };
        const config = statusMap[status] || { label: status, variant: "secondary" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
                <p className="text-muted-foreground">
                    Quản lý tất cả đơn hàng trong hệ thống
                </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo mã đơn hàng hoặc trạng thái..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã đơn</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày đặt</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}>
                                        <Skeleton className="h-12 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredOrders && filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        {order.transactionId}
                                    </TableCell>
                                    <TableCell>
                                        Khách hàng #{order.customerId || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {order.totalPrice?.toLocaleString("vi-VN")}đ
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(order.status)}
                                    </TableCell>
                                    <TableCell>
                                        {order.orderDate
                                            ? new Date(order.orderDate).toLocaleDateString("vi-VN")
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(order)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleChangeStatus(order)}
                                            >
                                                <Package className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-muted-foreground">
                                        Không tìm thấy đơn hàng nào
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                        <DialogDescription>
                            Thông tin chi tiết đơn hàng #{selectedOrder?.transactionId}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            <div className="grid gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Khách hàng</p>
                                        <p className="font-medium">
                                            Khách hàng #{selectedOrder.customerId || "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Trạng thái</p>
                                        <p className="font-medium">
                                            {getStatusBadge(selectedOrder.status)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ngày đặt</p>
                                        <p className="font-medium">
                                            {selectedOrder.orderDate
                                                ? new Date(selectedOrder.orderDate).toLocaleString("vi-VN")
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                                    <ShoppingCart className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tổng tiền</p>
                                        <p className="text-lg font-bold text-primary">
                                            {selectedOrder.totalPrice?.toLocaleString("vi-VN")}đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Status Dialog */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật trạng thái</DialogTitle>
                        <DialogDescription>
                            Thay đổi trạng thái đơn hàng #{selectedOrder?.transactionId}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Trạng thái mới</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                    <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                                    <SelectItem value="SHIPPING">Đang giao</SelectItem>
                                    <SelectItem value="DELIVERED">Đã giao</SelectItem>
                                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsStatusDialogOpen(false);
                                setSelectedOrder(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

