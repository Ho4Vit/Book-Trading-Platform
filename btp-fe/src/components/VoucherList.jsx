import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tag,
    Percent,
    DollarSign,
    Calendar,
    ShoppingCart,
    CheckCircle2,
    XCircle,
    Search,
    Sparkles,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function VoucherList({
    availableVouchers = [],
    selectedItems = [],
    totalPrice = 0,
    onSelectVoucher,
    appliedVoucher = null,
    isLoading = false
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // Calculate which vouchers are usable
    const vouchersWithStatus = useMemo(() => {
        return availableVouchers.map(voucher => {
            const selectedBookIds = selectedItems.map(item => item.bookId);

            // Check if voucher applies to any selected book
            const hasApplicableBooks = voucher.applicableBookIds?.some(bookId =>
                selectedBookIds.includes(bookId)
            );

            // Check minimum order value
            const meetsMinValue = totalPrice >= (voucher.minOrderValue || 0);

            // Check if expired
            const isExpired = new Date(voucher.expiryDate) < new Date();

            // Check if active
            const isActive = voucher.active;

            const canUse = hasApplicableBooks && meetsMinValue && !isExpired && isActive;

            let reason = "";
            if (isExpired) {
                reason = "Đã hết hạn";
            } else if (!isActive) {
                reason = "Không khả dụng";
            } else if (!hasApplicableBooks) {
                reason = "Không áp dụng cho sản phẩm đã chọn";
            } else if (!meetsMinValue) {
                const remaining = (voucher.minOrderValue || 0) - totalPrice;
                reason = `Cần thêm ${remaining.toLocaleString()}₫`;
            }

            return {
                ...voucher,
                canUse,
                reason,
                isApplied: appliedVoucher?.id === voucher.id
            };
        });
    }, [availableVouchers, selectedItems, totalPrice, appliedVoucher]);

    // Filter and categorize vouchers
    const filteredVouchers = useMemo(() => {
        let filtered = vouchersWithStatus;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(voucher =>
                voucher.code?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply tab filter
        if (activeTab === "usable") {
            filtered = filtered.filter(v => v.canUse);
        } else if (activeTab === "unusable") {
            filtered = filtered.filter(v => !v.canUse);
        }

        return filtered;
    }, [vouchersWithStatus, searchQuery, activeTab]);

    const usableCount = vouchersWithStatus.filter(v => v.canUse).length;
    const unusableCount = vouchersWithStatus.filter(v => !v.canUse).length;

    const calculateDiscount = (voucher) => {
        if (voucher.percentage) {
            const discount = (totalPrice * voucher.discountAmount) / 100;
            return Math.round(discount);
        }
        return Math.min(voucher.discountAmount, totalPrice);
    };

    const VoucherCard = ({ voucher }) => {
        const discountValue = calculateDiscount(voucher);

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                <Card
                    className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                        voucher.isApplied 
                            ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950' 
                            : voucher.canUse 
                            ? 'border-2 border-primary hover:shadow-lg hover:border-primary/70' 
                            : 'opacity-60 border-dashed cursor-not-allowed'
                    }`}
                    onClick={() => voucher.canUse && !voucher.isApplied && onSelectVoucher(voucher)}
                >
                    {/* Decorative background pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                        <Tag className="w-full h-full rotate-12" />
                    </div>

                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            {/* Icon Section */}
                            <div className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center ${
                                voucher.canUse 
                                    ? 'bg-gradient-to-br from-primary to-purple-600' 
                                    : 'bg-gray-400'
                            }`}>
                                {voucher.percentage ? (
                                    <Percent className="w-8 h-8 text-white" />
                                ) : (
                                    <DollarSign className="w-8 h-8 text-white" />
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">
                                            {voucher.code}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Giảm {voucher.percentage
                                                ? `${voucher.discountAmount}%`
                                                : `${voucher.discountAmount.toLocaleString()}₫`
                                            }
                                        </p>
                                    </div>
                                    {voucher.isApplied && (
                                        <Badge className="bg-green-500 text-white">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Đang dùng
                                        </Badge>
                                    )}
                                </div>

                                {/* Voucher Details */}
                                <div className="space-y-1 mb-3">
                                    {voucher.minOrderValue > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <ShoppingCart className="w-3 h-3" />
                                            <span>Đơn tối thiểu: {voucher.minOrderValue.toLocaleString()}₫</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            HSD: {format(new Date(voucher.expiryDate), "dd/MM/yyyy", { locale: vi })}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                {voucher.canUse ? (
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Có thể sử dụng
                                        </Badge>
                                        <span className="text-sm font-semibold text-green-600">
                                            Tiết kiệm {discountValue.toLocaleString()}₫
                                        </span>
                                    </div>
                                ) : (
                                    <Badge variant="outline" className="text-red-600 border-red-600">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        {voucher.reason}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>

                    {/* Dashed border decoration */}
                    {voucher.canUse && !voucher.isApplied && (
                        <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-lg pointer-events-none" />
                    )}
                </Card>
            </motion.div>
        );
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                    <Tag className="w-4 h-4" />
                    Chọn mã giảm giá
                    {usableCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                            {usableCount} khả dụng
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[80vh] p-0">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="w-6 h-6 text-primary" />
                        Mã giảm giá của bạn
                    </DialogTitle>
                    <DialogDescription>
                        Chọn mã giảm giá để áp dụng cho đơn hàng
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm mã giảm giá..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <Separator />

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">
                                Tất cả ({vouchersWithStatus.length})
                            </TabsTrigger>
                            <TabsTrigger value="usable">
                                Dùng được ({usableCount})
                            </TabsTrigger>
                            <TabsTrigger value="unusable">
                                Không dùng được ({unusableCount})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="h-[400px] px-6">
                        <TabsContent value={activeTab} className="mt-4 space-y-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : filteredVouchers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
                                    <h3 className="font-semibold text-lg mb-2">
                                        {searchQuery ? "Không tìm thấy mã giảm giá" : "Chưa có mã giảm giá"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchQuery
                                            ? "Thử tìm kiếm với từ khóa khác"
                                            : activeTab === "usable"
                                            ? "Chưa có mã giảm giá khả dụng cho đơn hàng này"
                                            : "Chưa có mã giảm giá nào"}
                                    </p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredVouchers.map((voucher) => (
                                        <VoucherCard key={voucher.id} voucher={voucher} />
                                    ))}
                                </AnimatePresence>
                            )}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                {/* Info Footer */}
                {selectedItems.length === 0 && (
                    <div className="px-6 pb-6">
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Vui lòng chọn sản phẩm trong giỏ hàng để xem mã giảm giá khả dụng
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

