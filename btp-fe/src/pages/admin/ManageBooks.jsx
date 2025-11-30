import React, { useState } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { bookApi, categoryApi, seriesApi } from "@/api/index.js";
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
import { Textarea } from "@/components/ui/textarea";
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
import { BookOpen, Edit, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageBooks() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [bookForm, setBookForm] = useState({
        title: "",
        author: "",
        price: "",
        quantity: "",
        description: "",
        categoryId: "",
        seriesId: "",
    });

    // Fetch data
    const { data: books, isLoading, refetch } = useCustomQuery(
        ["admin-books"],
        bookApi.getAllBooks
    );

    const { data: categoriesResponse } = useCustomQuery(
        ["categories"],
        categoryApi.getAllCategories
    );

    const { data: seriesResponse } = useCustomQuery(["series"], seriesApi.getAllSeries);

    // Extract data from response
    const categories = categoriesResponse || [];
    const series = seriesResponse || [];

    // Mutations
    const updateMutation = useCustomMutation(
        (data) => bookApi.updateBooks(selectedBook.id, data),
        null,
        {
            onSuccess: () => {
                toast.success("Cập nhật sách thành công!");
                setIsEditDialogOpen(false);
                setSelectedBook(null);
                refetch();
            },
        }
    );

    const deleteMutation = useCustomMutation(
        (id) => bookApi.deleteBooks(id),
        null,
        {
            onSuccess: () => {
                toast.success("Xóa sách thành công!");
                setIsDeleteDialogOpen(false);
                setSelectedBook(null);
                refetch();
            },
        }
    );

    // Filter books
    const filteredBooks = books?.filter(
        (book) =>
            book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (book) => {
        setSelectedBook(book);
        setBookForm({
            title: book.title || "",
            author: book.author || "",
            price: book.price || "",
            quantity: book.quantity || book.stock || "",
            description: book.description || "",
            categoryId: book.categoryId?.toString() || "",
            seriesId: book.seriesId?.toString() || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        const { categoryId, ...restForm } = bookForm;
        updateMutation.mutate({
            ...restForm,
            price: parseFloat(bookForm.price),
            quantity: parseInt(bookForm.quantity),
            categoryIds: categoryId ? [parseInt(categoryId)] : [],
        });
    };

    const handleDelete = (book) => {
        setSelectedBook(book);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        deleteMutation.mutate(selectedBook.bookId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý sách</h1>
                    <p className="text-muted-foreground">
                        Quản lý tất cả sách trong hệ thống
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
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
                            <TableHead>ID</TableHead>
                            <TableHead>Tên sách</TableHead>
                            <TableHead>Tác giả</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Số lượng</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7}>
                                        <Skeleton className="h-12 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredBooks && filteredBooks.length > 0 ? (
                            filteredBooks.map((book) => (
                                <TableRow key={book.bookId || book.id}>
                                    <TableCell className="font-medium">
                                        #{book.bookId || book.id}
                                    </TableCell>
                                    <TableCell>{book.title}</TableCell>
                                    <TableCell>{book.author}</TableCell>
                                    <TableCell>
                                        {book.price?.toLocaleString("vi-VN")}đ
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                (book.quantity || book.stock) > 10
                                                    ? "default"
                                                    : (book.quantity || book.stock) > 0
                                                    ? "secondary"
                                                    : "destructive"
                                            }
                                        >
                                            {book.quantity || book.stock || 0}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {book.categoryNames?.join(", ") ||
                                         categories?.find(
                                            (c) => c.id === book.categoryId
                                        )?.name || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(book)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(book)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-muted-foreground">
                                        Không tìm thấy sách nào
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa sách</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin sách #{selectedBook?.bookId}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Tên sách *</Label>
                            <Input
                                id="edit-title"
                                value={bookForm.title}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, title: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-author">Tác giả *</Label>
                            <Input
                                id="edit-author"
                                value={bookForm.author}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, author: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-price">Giá *</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    value={bookForm.price}
                                    onChange={(e) =>
                                        setBookForm({ ...bookForm, price: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-quantity">Số lượng *</Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    value={bookForm.quantity}
                                    onChange={(e) =>
                                        setBookForm({ ...bookForm, quantity: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Danh mục</Label>
                            <Select
                                value={bookForm.categoryId}
                                onValueChange={(value) =>
                                    setBookForm({ ...bookForm, categoryId: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id.toString()}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-series">Series</Label>
                            <Select
                                value={bookForm.seriesId}
                                onValueChange={(value) =>
                                    setBookForm({ ...bookForm, seriesId: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn series" />
                                </SelectTrigger>
                                <SelectContent>
                                    {series?.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={s.id.toString()}
                                        >
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Mô tả</Label>
                            <Textarea
                                id="edit-description"
                                value={bookForm.description}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, description: e.target.value })
                                }
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setSelectedBook(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa sách</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sách "{selectedBook?.title}"? Hành động
                            này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

