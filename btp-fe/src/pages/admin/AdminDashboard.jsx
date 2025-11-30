import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCustomQuery from "@/hooks/useCustomQuery";
import { bookApi, customerApi, sellerApi, orderApi } from "@/api/index.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BookOpen,
    Users,
    ShoppingCart,
    Store,
    TrendingUp,
    ArrowRight,
    Package,
    DollarSign,
} from "lucide-react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
    const navigate = useNavigate();

    // Fetch data
    const { data: books, isLoading: booksLoading } = useCustomQuery(
        ["admin-books"],
        bookApi.getAllBooks
    );

    const { data: customersResponse, isLoading: customersLoading } = useCustomQuery(
        ["admin-customers"],
        customerApi.getAllCustomers
    );

    const { data: sellersResponse, isLoading: sellersLoading } = useCustomQuery(
        ["admin-sellers"],
        sellerApi.getAllSellers
    );

    const { data: orders, isLoading: ordersLoading } = useCustomQuery(
        ["admin-orders"],
        orderApi.getAllOrders
    );

    // Extract data from response
    const customers = customersResponse || [];
    const sellers = sellersResponse || [];

    const isLoading = booksLoading || customersLoading || sellersLoading || ordersLoading;

    // Calculate statistics
    const stats = [
        {
            title: "Tổng sách",
            value: books?.length || 0,
            icon: BookOpen,
            description: "Sách trong hệ thống",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            link: "/admin/books",
        },
        {
            title: "Khách hàng",
            value: customers?.length || 0,
            icon: Users,
            description: "Người dùng đã đăng ký",
            color: "text-green-600",
            bgColor: "bg-green-100",
            link: "/admin/users",
        },
        {
            title: "Người bán",
            value: sellers?.length || 0,
            icon: Store,
            description: "Người bán hoạt động",
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            link: "/admin/users",
        },
        {
            title: "Đơn hàng",
            value: orders?.length || 0,
            icon: ShoppingCart,
            description: "Tổng đơn hàng",
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            link: "/admin/orders",
        },
    ];

    // Recent orders for quick view
    const recentOrders = orders?.slice(0, 5) || [];

    // Process data for charts
    const userStatsData = useMemo(() => {
        return [
            {
                name: "Người dùng",
                "Khách hàng": customers?.length || 0,
                "Người bán": sellers?.length || 0,
            }
        ];
    }, [customers, sellers]);

    const ordersByMonthData = useMemo(() => {
        if (!orders || orders.length === 0) return [];

        // Group orders by month
        const ordersByMonth = {};

        orders.forEach(order => {
            if (order.orderDate) {
                const date = new Date(order.orderDate);
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

                if (!ordersByMonth[monthYear]) {
                    ordersByMonth[monthYear] = {
                        month: monthYear,
                        count: 0,
                        revenue: 0,
                    };
                }

                ordersByMonth[monthYear].count += 1;
                ordersByMonth[monthYear].revenue += order.totalPrice || 0;
            }
        });

        // Convert to array and sort by date
        return Object.values(ordersByMonth)
            .sort((a, b) => {
                const [monthA, yearA] = a.month.split('/').map(Number);
                const [monthB, yearB] = b.month.split('/').map(Number);
                return yearA !== yearB ? yearA - yearB : monthA - monthB;
            })
            .slice(-6); // Get last 6 months
    }, [orders]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
                <p className="text-muted-foreground">
                    Chào mừng đến với trang quản trị BookNest
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(stat.link)}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-8 w-20" />
                                ) : (
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* User Statistics Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê người dùng</CardTitle>
                        <CardDescription>
                            So sánh số lượng khách hàng và người bán
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[300px] w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={userStatsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Khách hàng" fill="#10b981" />
                                    <Bar dataKey="Người bán" fill="#8b5cf6" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Orders Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Xu hướng đơn hàng</CardTitle>
                        <CardDescription>
                            Số lượng đơn hàng theo tháng (6 tháng gần nhất)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {ordersLoading ? (
                            <Skeleton className="h-[300px] w-full" />
                        ) : ordersByMonthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={ordersByMonthData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        name="Số đơn hàng"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                <div className="text-center">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Chưa có dữ liệu đơn hàng</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

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
                                onClick={() => navigate("/admin/orders")}
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
                                                    Đơn hàng {order.transactionId}
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
                        <CardDescription>Các chức năng thường dùng</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => navigate("/admin/books")}
                        >
                            <BookOpen className="h-4 w-4" />
                            Quản lý sách
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => navigate("/admin/users")}
                        >
                            <Users className="h-4 w-4" />
                            Quản lý người dùng
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => navigate("/admin/orders")}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Quản lý đơn hàng
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => navigate("/admin/categories")}
                        >
                            <Package className="h-4 w-4" />
                            Quản lý danh mục
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => navigate("/admin/series")}
                        >
                            <TrendingUp className="h-4 w-4" />
                            Quản lý series
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
