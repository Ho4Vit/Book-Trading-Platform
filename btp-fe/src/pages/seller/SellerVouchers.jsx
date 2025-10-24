import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { discountApi, sellerApi, bookApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    Ticket,
    Plus,
    Trash2,
    DollarSign,
    Percent,
    Search,
    AlertCircle,
    Tag,
    Calendar as CalendarIcon, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/Calendar";
import { vi } from "date-fns/locale"

export default function SellerVouchers() {
    const { userId } = useAuthStore();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        discountAmount: "",
        percentage: true,
        minOrderValue: "",
        expiryDate: "",
        active: true,
    });

    // Fetch seller info to get store name
    const { data: sellerData, isLoading: sellerLoading } = useCustomQuery(
        ["seller", userId],
        () => sellerApi.getSellerById(userId),
        {
            enabled: !!userId,
        }
    );

    // Fetch seller's books
    const { data: booksData, isLoading: booksLoading } = useCustomQuery(
        ["sellerBooks", userId],
        () => bookApi.getBookBySeller(userId),
        {
            enabled: !!userId,
        }
    );

    // Fetch all discounts
    const { data: discountsData, isLoading: discountsLoading } = useCustomQuery(
        ["discounts"],
        () => discountApi.getAllDiscounts(),
        {
            refetchInterval: 30000,
        }
    );

    const seller = sellerData?.data || sellerData;

    // Get seller's book IDs
    const sellerBooks = Array.isArray(booksData?.data)
        ? booksData.data
        : Array.isArray(booksData)
        ? booksData
        : [];
    const sellerBookIds = sellerBooks.map((book) => book.id);

    // Filter discounts by applicable book IDs (show vouchers applicable to seller's books)
    const storeDiscounts = useMemo(() => {
        const allDiscounts = Array.isArray(discountsData?.data)
            ? discountsData.data
            : Array.isArray(discountsData)
            ? discountsData
            : [];

        // Filter vouchers that have at least one book ID matching seller's books
        return allDiscounts.filter((discount) => {
            const applicableIds = discount.applicableBookIds || [];
            // Check if any of seller's book IDs are in the applicable book IDs
            return sellerBookIds.some((bookId) => applicableIds.includes(bookId));
        });
    }, [discountsData, sellerBookIds]);

    // Search filter
    const filteredDiscounts = useMemo(() => {
        if (!searchQuery) return storeDiscounts;

        return storeDiscounts.filter((discount) =>
            discount.code?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [storeDiscounts, searchQuery]);

    // Create discount mutation
    const createDiscountMutation = useCustomMutation(
        (data) => discountApi.createDiscount(data),
        null,
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["discounts"]);
                setIsCreateDialogOpen(false);
                resetForm();
                toast.success("Tạo voucher thành công!");
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể tạo voucher");
            },
        }
    );

    // Delete discount mutation
    const deleteDiscountMutation = useCustomMutation(
        (discountId) => discountApi.deleteDiscount(discountId),
        null,
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["discounts"]);
                setDeleteDialogOpen(false);
                setSelectedDiscount(null);
                toast.success("Xóa voucher thành công!");
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể xóa voucher");
            },
        }
    );

    const resetForm = () => {
        setFormData({
            code: "",
            discountAmount: "",
            percentage: true,
            minOrderValue: "",
            expiryDate: "",
            active: true,
        });
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateDiscount = () => {
        // Validate form
        if (!formData.code.trim()) {
            toast.error("Vui lòng nhập mã voucher");
            return;
        }
        if (!formData.discountAmount || formData.discountAmount <= 0) {
            toast.error("Vui lòng nhập giá trị giảm giá hợp lệ");
            return;
        }
        if (!formData.expiryDate) {
            toast.error("Vui lòng chọn ngày hết hạn");
            return;
        }
        if (sellerBookIds.length === 0) {
            toast.error("Bạn cần có ít nhất một sản phẩm để tạo voucher");
            return;
        }

        const discountData = {
            code: formData.code.toUpperCase(),
            discountAmount: parseFloat(formData.discountAmount),
            percentage: formData.percentage,
            minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
            createdAt: new Date().toISOString(),
            expiryDate: new Date(formData.expiryDate).toISOString(),
            active: formData.active,
            provider: "STORE", // Use STORE enum for seller vouchers
            providedUserIds: [],
            applicableBookIds: sellerBookIds, // Add all seller's book IDs
        };

        createDiscountMutation.mutate(discountData);
    };

    const handleDeleteDiscount = (discount) => {
        setSelectedDiscount(discount);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedDiscount) {
            deleteDiscountMutation.mutate(selectedDiscount.id);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return format(new Date(dateString), "dd/MM/yyyy");
        } catch {
            return dateString;
        }
    };

    // --- Thêm helper format tiền ---
    const formatVND = (value) => {
        if (!value) return "";
        return new Intl.NumberFormat("vi-VN").format(value);
    };

    const parseVND = (value) => {
        if (!value) return 0;
        return parseInt(value.replace(/\./g, ""), 10) || 0;
    };

    const isExpired = (expiryDate) => {
        return new Date(expiryDate) < new Date();
    };

    if (sellerLoading || booksLoading || discountsLoading) {
        return (
            <div className="w-full space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
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
                        <Ticket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Quản lý Voucher</h1>
                        <p className="text-muted-foreground">
                            Tạo và quản lý voucher giảm giá cho cửa hàng
                        </p>
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Tạo Voucher
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Tạo Voucher Mới</DialogTitle>
                            <DialogDescription>
                                Tạo voucher giảm giá cho khách hàng của bạn
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 py-2">
                            {/* Code */}
                            <div className="space-y-2">
                                <Label htmlFor="code">
                                    Mã Voucher <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    placeholder="VD: SUMMER2025"
                                    value={formData.code}
                                    onChange={(e) =>
                                        handleInputChange("code", e.target.value.toUpperCase())
                                    }
                                />
                            </div>

                            {/* Type of discount */}
                            <div className="space-y-2">
                                <Label>Loại giảm giá</Label>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={formData.percentage}
                                        onCheckedChange={(checked) =>
                                            handleInputChange("percentage", checked)
                                        }
                                    />
                                    <Label className="cursor-pointer">
                                        {formData.percentage
                                            ? "Phần trăm (%)"
                                            : "Số tiền cố định (₫)"}
                                    </Label>
                                </div>
                            </div>

                            {/* Discount value */}
                            <div className="space-y-2">
                                <Label htmlFor="discountAmount">
                                    Giá trị giảm {formData.percentage ? "(%)" : "(₫)"}{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="discountAmount"
                                    type="text"
                                    placeholder={formData.percentage ? "VD: 10" : "VD: 50.000"}
                                    value={
                                        formData.percentage
                                            ? formData.discountAmount
                                            : formatVND(formData.discountAmount)
                                    }
                                    onChange={(e) => {
                                        const rawValue = e.target.value;
                                        const parsedValue = formData.percentage
                                            ? rawValue
                                            : parseVND(rawValue);
                                        handleInputChange("discountAmount", parsedValue);
                                    }}
                                    min="0"
                                    max={formData.percentage ? "100" : undefined}
                                />
                            </div>

                            {/* Minimum order */}
                            <div className="space-y-2">
                                <Label htmlFor="minOrderValue">Giá trị đơn hàng tối thiểu (₫)</Label>
                                <Input
                                    id="minOrderValue"
                                    type="text"
                                    placeholder="VD: 100.000"
                                    value={formatVND(formData.minOrderValue)}
                                    onChange={(e) => {
                                        const parsedValue = parseVND(e.target.value);
                                        handleInputChange("minOrderValue", parsedValue);
                                    }}
                                />
                            </div>

                            {/* Expiry date with Calendar */}
                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">
                                    Ngày hết hạn <span className="text-red-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${
                                                !formData.expiryDate && "text-muted-foreground"
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.expiryDate
                                                ? format(new Date(formData.expiryDate), "dd/MM/yyyy", {
                                                    locale: vi,
                                                })
                                                : "Chọn ngày hết hạn"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                formData.expiryDate
                                                    ? new Date(formData.expiryDate)
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                handleInputChange(
                                                    "expiryDate",
                                                    date ? date.toISOString() : ""
                                                )
                                            }
                                            disabled={(date) => date < new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Active switch */}
                            <div className="flex items-center gap-2 pt-2">
                                <Switch
                                    id="active"
                                    checked={formData.active}
                                    onCheckedChange={(checked) =>
                                        handleInputChange("active", checked)
                                    }
                                />
                                <Label htmlFor="active" className="cursor-pointer">
                                    Kích hoạt ngay
                                </Label>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsCreateDialogOpen(false);
                                    resetForm();
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleCreateDiscount}
                                disabled={createDiscountMutation.isPending}
                                className="gap-2"
                            >
                                {createDiscountMutation.isPending && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                {createDiscountMutation.isPending ? "Đang tạo..." : "Tạo Voucher"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Ticket className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng Voucher</p>
                                <p className="text-2xl font-bold">{storeDiscounts.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                                <p className="text-2xl font-bold">
                                    {storeDiscounts.filter((d) => d.active && !isExpired(d.expiryDate)).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Hết hạn</p>
                                <p className="text-2xl font-bold">
                                    {storeDiscounts.filter((d) => isExpired(d.expiryDate)).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm mã voucher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Vouchers List */}
            {filteredDiscounts.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Ticket className="w-20 h-20 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            {searchQuery ? "Không tìm thấy voucher" : "Chưa có voucher nào"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {searchQuery
                                ? "Thử tìm kiếm với từ khóa khác"
                                : "Tạo voucher đầu tiên để thu hút khách hàng"}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Tạo Voucher
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDiscounts.map((discount) => {
                        const expired = isExpired(discount.expiryDate);
                        const isActive = discount.active && !expired;

                        return (
                            <Card
                                key={discount.id}
                                className={`relative overflow-visible ${
                                    isActive
                                        ? "border-primary/50"
                                        : "border-muted opacity-75"
                                }`}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                                                <Ticket className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-bold">
                                                    {discount.code}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground">
                                                    {discount.provider}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={isActive ? "default" : "secondary"}
                                            className={
                                                expired
                                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                                    : ""
                                            }
                                        >
                                            {expired
                                                ? "Hết hạn"
                                                : discount.active
                                                ? "Hoạt động"
                                                : "Tắt"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                                        {discount.percentage ? (
                                            <>
                                                <Percent className="w-5 h-5" />
                                                {discount.discountAmount}%
                                            </>
                                        ) : (
                                            <>
                                                <DollarSign className="w-5 h-5" />
                                                {discount.discountAmount.toLocaleString("vi-VN")}₫
                                            </>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="space-y-2 text-sm">
                                        {discount.minOrderValue > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Đơn tối thiểu:
                                                </span>
                                                <span className="font-semibold">
                                                    {discount.minOrderValue.toLocaleString("vi-VN")}₫
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                Hết hạn:
                                            </span>
                                            <span className={expired ? "text-red-600 font-semibold" : "font-semibold"}>
                                                {formatDate(discount.expiryDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Đã dùng:</span>
                                            <span className="font-semibold">
                                                {discount.providedUserIds?.length || 0} lần
                                            </span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex gap-2">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1 gap-2"
                                            onClick={() => handleDeleteDiscount(discount)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Xóa
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa voucher</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa voucher <strong>{selectedDiscount?.code}</strong>?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

