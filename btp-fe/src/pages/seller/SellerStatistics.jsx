import React, { useState, useMemo } from "react";
import { sellerApi } from "@/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import { useAuthStore } from "@/store/authStore";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart as BarChartIcon,
    DollarSign,
    Package,
    BookOpen,
    Calendar,
    TrendingDown,
    Activity,
} from "lucide-react";
// Import Recharts components
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function SellerStatistics() {
    const { userId } = useAuthStore();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());

    // 1. Fetch statistics for the selected specific month
    const { data: monthlyStatsData, isLoading: isLoadingMonthly } = useCustomQuery(
        ["seller-statistics-monthly", userId, selectedMonth, selectedYear],
        () => sellerApi.staticsSellerMonthly(userId, parseInt(selectedMonth), parseInt(selectedYear)),
        {
            enabled: !!userId,
        }
    );

    // 2. Fetch statistics for ALL months in the selected year (for the Bar Chart)
    const { data: yearlyStatsData, isLoading: isLoadingYearly } = useCustomQuery(
        ["seller-statistics-yearly", userId, selectedYear],
        async () => {
            // Create 12 promises to fetch data for each month
            const promises = Array.from({ length: 12 }, (_, i) =>
                sellerApi.staticsSellerMonthly(userId, i + 1, parseInt(selectedYear))
                    .catch(() => ({ totalRevenue: 0 })) // Handle errors gracefully
            );
            return Promise.all(promises);
        },
        {
            enabled: !!userId,
        }
    );

    // Process specific month stats
    const monthlyStats = useMemo(() => {
        return monthlyStatsData || null;
    }, [monthlyStatsData]);

    // Process top books for the Pie Chart
    const topBooks = useMemo(() => {
        if (!monthlyStats || !monthlyStats.bookSales) {
            return [];
        }
        return [...monthlyStats.bookSales].sort((a, b) => b.quantity - a.quantity);
    }, [monthlyStats]);

    // Data for Pie Chart (Top 5 books + Others)
    const pieChartData = useMemo(() => {
        if (topBooks.length === 0) return [];

        const top5 = topBooks.slice(0, 5).map(book => ({
            name: book.bookTitle.length > 20 ? book.bookTitle.substring(0, 20) + '...' : book.bookTitle,
            value: book.quantity
        }));

        const othersCount = topBooks.slice(5).reduce((acc, curr) => acc + curr.quantity, 0);

        if (othersCount > 0) {
            top5.push({ name: 'Khác', value: othersCount });
        }

        return top5;
    }, [topBooks]);

    // Data for Bar Chart (Revenue across 12 months)
    const revenueChartData = useMemo(() => {
        if (!Array.isArray(yearlyStatsData)) return [];

        return yearlyStatsData.map((stat, index) => {
            const actualData = stat?.data || stat;

            return {
                name: `Tháng ${index + 1}`,
                revenue: actualData?.totalRevenue || 0,
                sold: actualData?.totalSold || 0
            };
        });
    }, [yearlyStatsData]);

    const displayRevenue = monthlyStats?.totalRevenue || 0;
    const displaySold = monthlyStats?.totalSold || 0;

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `Tháng ${i + 1}`,
    }));

    const yearOptions = Array.from({ length: 3 }, (_, i) => ({
        value: (currentYear - i).toString(),
        label: `Năm ${currentYear - i}`,
    }));

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const isLoading = isLoadingMonthly || isLoadingYearly;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BarChartIcon className="w-8 h-8 text-primary" />
                        Thống Kê Bán Hàng
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi doanh thu và hiệu suất bán hàng
                    </p>
                </div>
            </div>

            {/* Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Thời gian:</span>
                        </div>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((year) => (
                                    <SelectItem key={year.value} value={year.value}>
                                        {year.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Doanh thu tháng {selectedMonth}
                        </CardTitle>
                        <DollarSign className="w-5 h-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(displayRevenue)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Đã bán tháng {selectedMonth}
                        </CardTitle>
                        <Package className="w-5 h-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {displaySold.toLocaleString("vi-VN")} <span className="text-sm font-normal text-muted-foreground">cuốn</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Giá TB/Sách
                        </CardTitle>
                        <BookOpen className="w-5 h-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {displaySold > 0
                                ? formatCurrency(displayRevenue / displaySold)
                                : formatCurrency(0)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Số đầu sách bán được
                        </CardTitle>
                        <Activity className="w-5 h-5 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {topBooks.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                {/* Bar Chart: Yearly Revenue Trend */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Biểu đồ doanh thu năm {selectedYear}</CardTitle>
                        <CardDescription>
                            Tổng doanh thu theo từng tháng
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        interval={0}
                                        tickFormatter={(value, index) => (index % 2 === 0 ? value : '')} // Show every other month on small screens if needed
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            new Intl.NumberFormat("vi-VN", { notation: "compact", compactDisplay: "short" }).format(value)
                                        }
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        labelStyle={{ color: 'black' }}
                                    />
                                    <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Doanh thu" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart: Top Selling Breakdown */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tỷ trọng sách bán chạy</CardTitle>
                        <CardDescription>
                            Tháng {selectedMonth}/{selectedYear}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full relative">
                            {pieChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                                return percent > 0.05 ? (
                                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                                                        {`${(percent * 100).toFixed(0)}%`}
                                                    </text>
                                                ) : null;
                                            }}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value} cuốn`} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <TrendingDown className="w-8 h-8 mb-2" />
                                    <p>Chưa có dữ liệu</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Selling Books Table */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Chi tiết sách bán chạy
                    </CardTitle>
                    <CardDescription>
                        Danh sách đầy đủ cho tháng {selectedMonth}/{selectedYear}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {topBooks.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">#</TableHead>
                                    <TableHead>Tên sách</TableHead>
                                    <TableHead className="text-right">Số lượng bán</TableHead>
                                    <TableHead className="text-right">% Tổng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topBooks.map((book, index) => {
                                    const percentage = displaySold > 0
                                        ? ((book.quantity / displaySold) * 100).toFixed(1)
                                        : 0;
                                    return (
                                        <TableRow key={book.bookId}>
                                            <TableCell className="font-medium">
                                                <Badge
                                                    variant={index < 3 ? "default" : "secondary"}
                                                    className={
                                                        index === 0 ? "bg-amber-500 hover:bg-amber-600" :
                                                            index === 1 ? "bg-gray-400 hover:bg-gray-500" :
                                                                index === 2 ? "bg-orange-600 hover:bg-orange-700" : ""
                                                    }
                                                >
                                                    {index + 1}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {book.bookTitle}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {book.quantity.toLocaleString("vi-VN")}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {percentage}%
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                Chưa có dữ liệu bán hàng trong tháng này
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}