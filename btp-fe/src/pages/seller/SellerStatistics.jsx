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
    BarChart,
    DollarSign,
    Package,
    BookOpen,
    Calendar,
    TrendingDown,
    Activity,
} from "lucide-react";

export default function SellerStatistics() {
    const { userId } = useAuthStore();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());

    // Fetch monthly statistics
    const { data: monthlyStatsData, isLoading } = useCustomQuery(
        ["seller-statistics-monthly", userId, selectedMonth, selectedYear],
        () => sellerApi.staticsSellerMonthly(userId, parseInt(selectedMonth), parseInt(selectedYear)),
        {
            enabled: !!userId,
        }
    );

    // Parse statistics data
    const monthlyStats = useMemo(() => {
        return monthlyStatsData || null;
    }, [monthlyStatsData]);

    // Get top selling books sorted by quantity (descending)
    const topBooks = useMemo(() => {
        if (!monthlyStats || !monthlyStats.bookSales) {
            return [];
        }
        // Sort books by quantity in descending order
        return [...monthlyStats.bookSales].sort((a, b) => b.quantity - a.quantity);
    }, [monthlyStats]);

    // Display data
    const displayRevenue = monthlyStats?.totalRevenue || 0;
    const displaySold = monthlyStats?.totalSold || 0;

    // Generate month options for the last 12 months
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        return {
            value: month.toString(),
            label: `Tháng ${month}`,
        };
    });

    // Generate year options (current year and 2 years back)
    const yearOptions = Array.from({ length: 3 }, (_, i) => {
        const year = currentYear - i;
        return {
            value: year.toString(),
            label: `Năm ${year}`,
        };
    });

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BarChart className="w-8 h-8 text-primary" />
                        Thống Kê Bán Hàng
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi doanh thu và hiệu suất bán hàng theo tháng
                    </p>
                </div>
            </div>

            {/* Monthly Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Chọn kỳ:</span>
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

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Doanh thu tháng
                        </CardTitle>
                        <DollarSign className="w-5 h-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(displayRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tháng {selectedMonth}/{selectedYear}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Sold */}
                <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sách bán ra
                        </CardTitle>
                        <Package className="w-5 h-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {displaySold.toLocaleString("vi-VN")}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sách đã bán
                        </p>
                    </CardContent>
                </Card>

                {/* Average Revenue per Book */}
                <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Doanh thu trung bình
                        </p>
                    </CardContent>
                </Card>

                {/* Number of Book Types */}
                <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Số loại sách
                        </CardTitle>
                        <Activity className="w-5 h-5 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {topBooks.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sách khác nhau
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Selling Books */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Sách Bán Chạy
                    </CardTitle>
                    <CardDescription>
                        Top sách bán chạy tháng {selectedMonth}/{selectedYear} (sắp xếp theo số lượng)
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
                                                        index === 0
                                                            ? "bg-amber-500 hover:bg-amber-600"
                                                            : index === 1
                                                            ? "bg-gray-400 hover:bg-gray-500"
                                                            : index === 2
                                                            ? "bg-orange-600 hover:bg-orange-700"
                                                            : ""
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

