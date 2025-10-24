import React from "react";
import { useNavigate } from "react-router-dom";
import useCustomQuery from "@/hooks/useCustomQuery";
import { bookApi, orderApi } from "@/api/index.js";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import {
    BookOpen,
    ShoppingCart,
    TrendingUp,
    ArrowRight,
    Package,
    DollarSign,
    AlertCircle,
    Plus,
    MessageSquare, Ticket,
} from "lucide-react";

export default function SellerDashboard() {
    const navigate = useNavigate();
    const { userId } = useAuthStore();

    // Fetch seller's books
    const { data: sellerBooks, isLoading: booksLoading } = useCustomQuery(
        ["seller-books", userId],
        () => bookApi.getBookBySeller(userId),
        {
            enabled: !!userId,
        }
    );

    // Fetch seller's orders directly
    const { data: ordersData, isLoading: ordersLoading } = useCustomQuery(
        ["seller-orders", userId],
        () => orderApi.getOrderBySellerId(userId),
        {
            enabled: !!userId,
        }
    );

    const isLoading = booksLoading || ordersLoading;

    // Parse seller orders from API response
    const sellerOrders = Array.isArray(ordersData?.data)
        ? ordersData.data
        : Array.isArray(ordersData)
        ? ordersData
        : [];

    // Calculate statistics
    const totalBooks = sellerBooks?.length || 0;
    const totalStock =
        sellerBooks?.reduce(
            (sum, book) => sum + (book.quantity || book.stock || 0),
            0
        ) || 0;
    const lowStockBooks =
        sellerBooks?.filter((book) => (book.quantity || book.stock || 0) < 5)
            ?.length || 0;

    // Calculate total revenue from orders using totalPrice from response
    const totalRevenue = sellerOrders.reduce((sum, order) => {
        return sum + (order.totalPrice || 0);
    }, 0);

    const stats = [
        {
            title: "Tổng sách",
            value: totalBooks,
            icon: BookOpen,
            description: "Sách đang bán",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            link: "/seller/books",
        },
        {
            title: "Tồn kho",
            value: totalStock,
            icon: Package,
            description: "Sản phẩm trong kho",
            color: "text-green-600",
            bgColor: "bg-green-100",
            link: "/seller/inventory",
        },
        {
            title: "Đơn hàng",
            value: sellerOrders.length,
            icon: ShoppingCart,
            description: "Tổng đơn hàng",
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            link: "/seller/orders",
        },
        {
            title: "Doanh thu",
            value: `${totalRevenue.toLocaleString()}đ`,
            icon: DollarSign,
            description: "Tổng doanh thu",
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            link: "/seller/orders",
        },
    ];

    // Recent orders - sorted by orderDate (newest first)
    const recentOrders = [...sellerOrders]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
                <p className="text-muted-foreground">
                    Chào mừng đến với trang quản lý người bán
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={index}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(stat.link)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <div
                                    className={`p-2 rounded-lg ${stat.bgColor}`}
                                >
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-20" />
                                ) : (
                                    <div className="text-2xl font-bold">
                                        {stat.value}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Alerts */}
            {lowStockBooks > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <CardTitle className="text-orange-900">
                                Cảnh báo tồn kho
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-orange-800">
                            Có {lowStockBooks} sản phẩm sắp hết hàng (dưới 5 cuốn).
                            <Button
                                variant="link"
                                className="text-orange-600 p-0 h-auto ml-1"
                                onClick={() => navigate("/seller/inventory")}
                            >
                                Xem ngay →
                            </Button>
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Orders */}
                <Card className="col-span-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Đơn hàng gần đây</CardTitle>
                                <CardDescription>
                                    {recentOrders.length} đơn hàng mới nhất
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/seller/orders")}
                                className="gap-2"
                            >
                                Xem tất cả
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {ordersLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Package className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Đơn hàng #{order.id}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.status || "Đang xử lý"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {order.totalPrice?.toLocaleString("vi-VN")}đ
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Chưa có đơn hàng nào</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Thao tác nhanh</CardTitle>
                        <CardDescription>Các tác vụ thường dùng</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            className="w-full justify-start gap-2"
                            variant="outline"
                            onClick={() => navigate("/seller/books")}
                        >
                            <Plus className="h-4 w-4" />
                            Thêm sách mới
                        </Button>
                        <Button
                            className="w-full justify-start gap-2"
                            variant="outline"
                            onClick={() => navigate("/seller/orders")}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Xem đơn hàng
                        </Button>
                        <Button
                            className="w-full justify-start gap-2"
                            variant="outline"
                            onClick={() => navigate("/seller/inventory")}
                        >
                            <Package className="h-4 w-4" />
                            Quản lý tồn kho
                        </Button>
                        <Button
                            className="w-full justify-start gap-2"
                            variant="outline"
                            onClick={() => navigate("/seller/vouchers")}
                        >
                            <Ticket className="h-4 w-4" />
                            Thêm Voucher
                        </Button>
                        <Button
                            className="w-full justify-start gap-2"
                            variant="outline"
                            onClick={() => navigate("/seller/feedbacks")}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Xem đánh giá
                        </Button>
                        <Button
                            className="w-full justify-start gap-2"
                            variant="outline"
                            onClick={() => navigate("/seller/profile")}
                        >
                            <TrendingUp className="h-4 w-4" />
                            Xem hồ sơ
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Top Selling Books */}
            <Card>
                <CardHeader>
                    <CardTitle>Sách bán chạy</CardTitle>
                    <CardDescription>
                        Top 5 sản phẩm có doanh số cao nhất
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {booksLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : sellerBooks && sellerBooks.length > 0 ? (
                        <div className="space-y-3">
                            {[...sellerBooks]
                                .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
                                .slice(0, 5)
                                .map((book, index) => (
                                <div
                                    key={book.id || book.bookId}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl font-bold text-muted-foreground">
                                            #{index + 1}
                                        </div>
                                        <img
                                            src={
                                                book.coverImage ||
                                                "https://via.placeholder.com/40"
                                            }
                                            alt={book.title}
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {book.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Đã bán:{" "}
                                                {book.soldCount || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">
                                            {book.price?.toLocaleString("vi-VN")}đ
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Tồn kho: {book.stock || 0}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Chưa có sách nào</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
