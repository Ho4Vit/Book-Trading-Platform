import React, { useState } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { bookApi } from "@/api/index.js";
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
import { Search, Package, AlertCircle, TrendingUp, TrendingDown, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function SellerInventory() {
    const { userId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedBook, setSelectedBook] = useState(null);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [stockUpdate, setStockUpdate] = useState({
        quantity: "",
        action: "add", // "add" or "set"
    });

    // Fetch seller's books
    const { data: sellerBooks, isLoading } = useCustomQuery(
        ["seller-books", userId],
        () => bookApi.getBookBySeller(userId),
        {
            enabled: !!userId,
        }
    );

    const books = sellerBooks || [];

    // Update book stock mutation
    const updateStockMutation = useCustomMutation(
        ({ bookId, data }) => bookApi.updateBooks(bookId, data),
        "PUT",
        {
            invalidateKeys: ["seller-books"],
            onSuccess: () => {
                toast.success("Cập nhật tồn kho thành công!");
                setIsUpdateDialogOpen(false);
                setSelectedBook(null);
            },
        }
    );

    // Filter books by search and status
    const filteredBooks = books.filter((book) => {
        const matchesSearch =
            book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchQuery.toLowerCase());

        const stock = book.stock || 0;
        let matchesStatus = true;

        if (statusFilter === "in-stock") {
            matchesStatus = stock >= 5;
        } else if (statusFilter === "low-stock") {
            matchesStatus = stock > 0 && stock < 5;
        } else if (statusFilter === "out-of-stock") {
            matchesStatus = stock === 0;
        }

        return matchesSearch && matchesStatus;
    });

    // Calculate statistics
    const totalStock = books.reduce((sum, book) => sum + (book.stock || 0), 0);
    const totalSold = books.reduce((sum, book) => sum + (book.soldCount || 0), 0);
    const lowStockBooks = books.filter(book => (book.stock || 0) < 5 && (book.stock || 0) > 0);
    const outOfStockBooks = books.filter(book => (book.stock || 0) === 0);

    const handleUpdateStock = (book) => {
        setSelectedBook(book);
        setStockUpdate({
            quantity: "",
            action: "add",
        });
        setIsUpdateDialogOpen(true);
    };

    const handleConfirmUpdate = async () => {
        if (!selectedBook || !stockUpdate.quantity) return;

        const currentStock = selectedBook.stock || 0;
        const newStock = stockUpdate.action === "add"
            ? currentStock + parseInt(stockUpdate.quantity)
            : parseInt(stockUpdate.quantity);

        // Fetch full book details first
        try {
            const bookDetails = await bookApi.getBookById(selectedBook.id);

            // Prepare update payload with all required fields
            const payload = {
                title: bookDetails.title,
                author: bookDetails.author,
                price: bookDetails.price,
                stock: Math.max(0, newStock),
                description: bookDetails.description,
                language: bookDetails.language,
                pageCount: bookDetails.pageCount || 0,
                format: bookDetails.format || "PAPERBACK",
                categoryIds: bookDetails.categoryIds || [],
                seriesId: bookDetails.seriesId || null,
                coverImage: bookDetails.coverImage,
                additionalImages: bookDetails.additionalImages || [],
            };

            updateStockMutation.mutate({
                bookId: selectedBook.id,
                data: payload,
            });
        } catch (error) {
            toast.error("Không thể cập nhật tồn kho!");
            console.error("Error updating stock:", error);
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) {
            return { label: "Hết hàng", variant: "destructive", icon: AlertCircle };
        } else if (stock < 5) {
            return { label: "Sắp hết", variant: "secondary", icon: TrendingDown };
        } else {
            return { label: "Còn hàng", variant: "default", icon: TrendingUp };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý tồn kho</h1>
                <p className="text-muted-foreground">
                    Theo dõi và cập nhật số lượng sách trong kho
                </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Tổng tồn kho</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStock}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sản phẩm trong kho
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Đã bán</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{totalSold}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sản phẩm đã bán
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-orange-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600">
                            Sắp hết hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {lowStockBooks.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Dưới 5 sản phẩm
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-red-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">
                            Hết hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {outOfStockBooks.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cần nhập thêm
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm sách..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="in-stock">Còn hàng</SelectItem>
                        <SelectItem value="low-stock">Sắp hết</SelectItem>
                        <SelectItem value="out-of-stock">Hết hàng</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách tồn kho</CardTitle>
                    <CardDescription>
                        {filteredBooks.length} sản phẩm
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : filteredBooks.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Sách</TableHead>
                                        <TableHead>Tác giả</TableHead>
                                        <TableHead>Giá</TableHead>
                                        <TableHead className="text-center">Tồn kho</TableHead>
                                        <TableHead className="text-center">Đã bán</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBooks.map((book) => {
                                        const stock = book.stock || 0;
                                        const status = getStockStatus(stock);
                                        const StatusIcon = status.icon;

                                        return (
                                            <TableRow key={book.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={book.coverImage || "https://via.placeholder.com/40"}
                                                            alt={book.title}
                                                            className="w-10 h-10 rounded object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium">{book.title}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{book.author}</TableCell>
                                                <TableCell>{book.price?.toLocaleString()}đ</TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`text-lg font-bold ${
                                                        stock === 0 ? "text-red-600" :
                                                        stock < 5 ? "text-orange-600" :
                                                        "text-green-600"
                                                    }`}>
                                                        {stock}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-lg font-semibold text-blue-600">
                                                        {book.soldCount}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={status.variant} className="gap-1">
                                                        <StatusIcon className="h-3 w-3" />
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleUpdateStock(book)}
                                                    >
                                                        <Package className="h-4 w-4 mr-1" />
                                                        Cập nhật
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-muted-foreground">
                                {searchQuery || statusFilter !== "all" ? "Không tìm thấy sách nào" : "Chưa có sách trong kho"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Update Stock Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật tồn kho</DialogTitle>
                        <DialogDescription>
                            Cập nhật số lượng sách trong kho
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBook && (
                        <div className="space-y-4 py-4">
                            {/* Book Info */}
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <img
                                    src={selectedBook.coverImage || "https://via.placeholder.com/60"}
                                    alt={selectedBook.title}
                                    className="w-12 h-12 rounded object-cover"
                                />
                                <div>
                                    <p className="font-medium">{selectedBook.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Tồn kho hiện tại: <span className="font-semibold">
                                            {selectedBook.stock || 0}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Action Type */}
                            <div className="space-y-2">
                                <Label>Hành động</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={stockUpdate.action === "add" ? "default" : "outline"}
                                        className="flex-1"
                                        onClick={() => setStockUpdate({ ...stockUpdate, action: "add" })}
                                    >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Thêm vào kho
                                    </Button>
                                    <Button
                                        variant={stockUpdate.action === "set" ? "default" : "outline"}
                                        className="flex-1"
                                        onClick={() => setStockUpdate({ ...stockUpdate, action: "set" })}
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Đặt lại số lượng
                                    </Button>
                                </div>
                            </div>

                            {/* Quantity Input */}
                            <div className="space-y-2">
                                <Label htmlFor="quantity">
                                    {stockUpdate.action === "add" ? "Số lượng thêm" : "Số lượng mới"}
                                </Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    value={stockUpdate.quantity}
                                    onChange={(e) =>
                                        setStockUpdate({ ...stockUpdate, quantity: e.target.value })
                                    }
                                    placeholder="Nhập số lượng"
                                />
                            </div>

                            {/* Preview */}
                            {stockUpdate.quantity && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-900">
                                        Tồn kho sau cập nhật: <span className="font-bold">
                                            {stockUpdate.action === "add"
                                                ? (selectedBook.stock || 0) + parseInt(stockUpdate.quantity)
                                                : parseInt(stockUpdate.quantity)
                                            }
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsUpdateDialogOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleConfirmUpdate}
                            disabled={updateStockMutation.isPending || !stockUpdate.quantity}
                        >
                            {updateStockMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
