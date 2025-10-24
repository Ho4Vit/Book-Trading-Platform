import React, { useState, useRef } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { bookApi, categoryApi, seriesApi } from "@/api/index.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Edit, Trash2, Search, ArrowUpDown, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import BookImageUpload from "@/components/BookImageUpload";
import BookRating from "@/components/BookRating";

export default function SellerBooks() {
    const { userId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [additionalImagesFiles, setAdditionalImagesFiles] = useState([]);
    const [additionalImagesPreviews, setAdditionalImagesPreviews] = useState([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [seriesNames, setSeriesNames] = useState({}); // Cache for series names
    const imageUploadRef = useRef(null);
    const [bookForm, setBookForm] = useState({
        title: "",
        author: "",
        price: "",
        description: "",
        language: "",
        pageCount: "",
        format: "PAPERBACK",
        categoryIds: [],
        seriesId: "",
    });

    // Fetch data
    const { data: sellerBooks, isLoading } = useCustomQuery(
        ["seller-books", userId],
        () => bookApi.getBookBySeller(userId),
        {
            enabled: !!userId,
        }
    );

    const { data: categoriesResponse } = useCustomQuery(
        ["categories"],
        categoryApi.getAllCategories
    );

    const { data: seriesResponse } = useCustomQuery(["series"], seriesApi.getAllSeries);

    // Extract data
    const categories = categoriesResponse || [];
    const series = seriesResponse || [];
    const books = sellerBooks || [];

    // Fetch series names for books that have seriesId
    React.useEffect(() => {
        const fetchSeriesNames = async () => {
            const booksWithSeries = books.filter(book => book.seriesId && !seriesNames[book.seriesId]);

            for (const book of booksWithSeries) {
                try {
                    const seriesData = await seriesApi.getSeriesById(book.seriesId);
                    setSeriesNames(prev => ({
                        ...prev,
                        [book.seriesId]: seriesData?.name || seriesData?.data?.name || "Unknown Series"
                    }));
                } catch (error) {
                    console.error(`Error fetching series ${book.seriesId}:`, error);
                }
            }
        };

        if (books.length > 0) {
            fetchSeriesNames();
        }
    }, [books, seriesNames]);

    // Mutations
    const createMutation = useCustomMutation(bookApi.createBook, "POST", {
        invalidateKeys: ["seller-books"],
        onSuccess: async (response) => {
            // Upload images if book created successfully
            const bookId = response?.id || response?.data?.id;
            if (bookId && (coverImageFile || additionalImagesFiles.length > 0)) {
                setIsUploadingImages(true);
                await uploadBookImages(bookId);
                setIsUploadingImages(false);
            }
            toast.success("Tạo sách thành công!");
            setIsCreateDialogOpen(false);
            resetForm();
        },
    });

    const updateMutation = useCustomMutation(
        (data) => bookApi.updateBooks(selectedBook.id, data),
        "PUT",
        {
            invalidateKeys: ["seller-books"],
            onSuccess: async () => {
                // Upload images if there are new files
                if (coverImageFile || additionalImagesFiles.length > 0) {
                    setIsUploadingImages(true);
                    await uploadBookImages(selectedBook.id);
                    setIsUploadingImages(false);
                }
                toast.success("Cập nhật sách thành công!");
                setIsEditDialogOpen(false);
                setSelectedBook(null);
                resetForm();
            },
        }
    );

    const deleteMutation = useCustomMutation(
        (id) => bookApi.deleteBooks(id),
        "DELETE",
        {
            invalidateKeys: ["seller-books"],
            onSuccess: () => {
                toast.success("Xóa sách thành công!");
                setIsDeleteDialogOpen(false);
                setSelectedBook(null);
            },
        }
    );

    const uploadBookImages = async (bookId) => {
        try {
            const formData = new FormData();

            if (coverImageFile) {
                formData.append('coverImage', coverImageFile);
            }

            if (additionalImagesFiles.length > 0) {
                additionalImagesFiles.forEach((file) => {
                    formData.append('additionalImages', file);
                });
            }

            await bookApi.imageBooks(bookId, formData);
            toast.success("Tải ảnh lên thành công!");
        } catch (error) {
            console.error("Error uploading images:", error);
            toast.error("Lỗi khi tải ảnh lên!");
        }
    };

    // Filter and sort books
    const filteredBooks = books
        ?.filter(
            (book) =>
                book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === "asc") {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });

    const resetForm = () => {
        setBookForm({
            title: "",
            author: "",
            price: "",
            description: "",
            language: "",
            pageCount: "",
            format: "PAPERBACK",
            categoryIds: [],
            seriesId: "",
        });
        setCoverImageFile(null);
        setCoverImagePreview(null);
        setAdditionalImagesFiles([]);
        setAdditionalImagesPreviews([]);
    };

    const handleCreate = () => {
        const payload = {
            title: bookForm.title,
            author: bookForm.author,
            price: parseFloat(bookForm.price),
            stock: 0,
            description: bookForm.description,
            language: bookForm.language,
            pageCount: bookForm.pageCount ? parseInt(bookForm.pageCount) : 0,
            format: bookForm.format,
            categoryIds: bookForm.categoryIds.map(id => parseInt(id)),
            seriesId: bookForm.seriesId ? parseInt(bookForm.seriesId) : null,
            sellerId: userId,
        };
        createMutation.mutate(payload);
    };

    const handleEdit = async (book) => {
        setSelectedBook(book);
        // Fetch full book details to get category IDs
        try {
            const bookDetails = await bookApi.getBookById(book.id);

            // Find category IDs from category names
            const categoryIds = categories
                .filter(cat => bookDetails.categoryNames?.includes(cat.name))
                .map(cat => cat.id.toString());

            setBookForm({
                title: bookDetails.title || "",
                author: bookDetails.author || "",
                price: bookDetails.price?.toString() || "",
                description: bookDetails.description || "",
                language: bookDetails.language || "",
                pageCount: bookDetails.pageCount?.toString() || "",
                format: bookDetails.format || "PAPERBACK",
                categoryIds: categoryIds,
                seriesId: bookDetails.seriesId?.toString() || "",
            });

            // Set existing images
            setCoverImagePreview(bookDetails.coverImage || null);
            setAdditionalImagesPreviews(bookDetails.additionalImages || []);
            setCoverImageFile(null);
            setAdditionalImagesFiles([]);

            setIsEditDialogOpen(true);
        } catch (error) {
            toast.error("Không thể tải thông tin sách!");
            console.error("Error fetching book details:", error);
        }
    };

    const handleUpdate = () => {
        const payload = {
            title: bookForm.title,
            author: bookForm.author,
            price: parseFloat(bookForm.price),
            stock: selectedBook.stock, // Keep existing stock
            description: bookForm.description,
            language: bookForm.language,
            pageCount: bookForm.pageCount ? parseInt(bookForm.pageCount) : 0,
            format: bookForm.format,
            categoryIds: bookForm.categoryIds.map(id => parseInt(id)),
            seriesId: bookForm.seriesId ? parseInt(bookForm.seriesId) : null,
        };
        updateMutation.mutate(payload);
    };

    const handleDelete = (book) => {
        setSelectedBook(book);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        deleteMutation.mutate(selectedBook.id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý sách</h1>
                    <p className="text-muted-foreground">
                        Quản lý các sách bạn đang bán
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm sách mới
                </Button>
            </div>

            {/* Search and Sort */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm sách..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[180px]">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">A-Z</SelectItem>
                        <SelectItem value="desc">Z-A</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Books Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-lg" />
                    ))}
                </div>
            ) : filteredBooks && filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBooks.map((book) => {
                        const categories = book.categoryNames || [];
                        const displayCategories = categories.slice(0, 2);
                        const hasMore = categories.length > 2;

                        // Get series name from cache or seriesId
                        const seriesName = book.seriesId ? seriesNames[book.seriesId] : null;

                        return (
                            <Card
                                key={book.id}
                                className="hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                            >
                                <div className="relative">
                                    <img
                                        src={book.coverImage || "https://via.placeholder.com/300x200"}
                                        alt={book.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <Badge
                                        className="absolute top-2 right-2"
                                        variant={book.stock < 5 ? "destructive" : "default"}
                                    >
                                        Kho: {book.stock}
                                    </Badge>
                                    <BookRating bookId={book.id} />
                                    {seriesName && (
                                        <Badge
                                            className="absolute top-2 left-2 bg-purple-500 text-white"
                                        >
                                            {seriesName}
                                        </Badge>
                                    )}
                                </div>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg line-clamp-1">
                                        {book.title}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {book.author}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Giá:</span>
                                        <span className="text-lg font-bold text-primary">
                                            {book.price?.toLocaleString()}đ
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Danh mục:</span>
                                        <div className="flex items-center gap-1 flex-wrap justify-end">
                                            {displayCategories.map((cat, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {cat}
                                                </Badge>
                                            ))}
                                            {hasMore && (
                                                <Badge variant="outline" className="text-xs">
                                                    ...
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 gap-2"
                                            onClick={() => handleEdit(book)}
                                        >
                                            <Edit className="h-3 w-3" />
                                            Sửa
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="flex-1 gap-2"
                                            onClick={() => handleDelete(book)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Xóa
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">
                        {searchQuery ? "Không tìm thấy sách nào" : "Chưa có sách nào. Thêm sách đầu tiên!"}
                    </p>
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Thêm sách mới</DialogTitle>
                        <DialogDescription>
                            Tạo sách mới trong cửa hàng của bạn
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Tên sách *</Label>
                            <Input
                                id="title"
                                value={bookForm.title}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, title: e.target.value })
                                }
                                placeholder="Nhập tên sách"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="author">Tác giả *</Label>
                            <Input
                                id="author"
                                value={bookForm.author}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, author: e.target.value })
                                }
                                placeholder="Nhập tên tác giả"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Giá *</Label>
                            <Input
                                id="price"
                                type="number"
                                value={bookForm.price}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, price: e.target.value })
                                }
                                placeholder="0"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="language">Ngôn ngữ</Label>
                                <Input
                                    id="language"
                                    value={bookForm.language}
                                    onChange={(e) =>
                                        setBookForm({ ...bookForm, language: e.target.value })
                                    }
                                    placeholder="Tiếng Việt"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="pageCount">Số trang</Label>
                                <Input
                                    id="pageCount"
                                    type="number"
                                    value={bookForm.pageCount}
                                    onChange={(e) =>
                                        setBookForm({ ...bookForm, pageCount: e.target.value })
                                    }
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="format">Định dạng</Label>
                                <Select
                                    value={bookForm.format}
                                    onValueChange={(value) =>
                                        setBookForm({ ...bookForm, format: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn định dạng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PAPERBACK">Bìa mềm</SelectItem>
                                        <SelectItem value="HARDCOVER">Bìa cứng</SelectItem>
                                        <SelectItem value="EBOOK">Sách điện tử</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="seriesId">Series</Label>
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
                                        {series.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Book Image Upload Component */}
                        <BookImageUpload
                            ref={imageUploadRef}
                            coverImagePreview={coverImagePreview}
                            setCoverImagePreview={setCoverImagePreview}
                            additionalImagesPreviews={additionalImagesPreviews}
                            setAdditionalImagesPreviews={setAdditionalImagesPreviews}
                            setCoverImageFile={setCoverImageFile}
                            setAdditionalImagesFiles={setAdditionalImagesFiles}
                        />

                        <div className="grid gap-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={bookForm.description}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, description: e.target.value })
                                }
                                placeholder="Nhập mô tả sách"
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={
                                createMutation.isPending ||
                                isUploadingImages ||
                                !bookForm.title ||
                                !bookForm.author ||
                                !bookForm.price
                            }
                        >
                            {createMutation.isPending || isUploadingImages ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                                    {isUploadingImages ? "Đang tải ảnh..." : "Đang tạo..."}
                                </>
                            ) : (
                                "Tạo sách"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa sách</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin sách
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
                                placeholder="Nhập tên sách"
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
                                placeholder="Nhập tên tác giả"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-price">Giá *</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                value={bookForm.price}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, price: e.target.value })
                                }
                                placeholder="0"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-language">Ngôn ngữ</Label>
                                <Input
                                    id="edit-language"
                                    value={bookForm.language}
                                    onChange={(e) =>
                                        setBookForm({ ...bookForm, language: e.target.value })
                                    }
                                    placeholder="Tiếng Việt"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-pageCount">Số trang</Label>
                                <Input
                                    id="edit-pageCount"
                                    type="number"
                                    value={bookForm.pageCount}
                                    onChange={(e) =>
                                        setBookForm({ ...bookForm, pageCount: e.target.value })
                                    }
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-format">Định dạng</Label>
                                <Select
                                    value={bookForm.format}
                                    onValueChange={(value) =>
                                        setBookForm({ ...bookForm, format: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn định dạng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PAPERBACK">Bìa mềm</SelectItem>
                                        <SelectItem value="HARDCOVER">Bìa cứng</SelectItem>
                                        <SelectItem value="EBOOK">Sách điện tử</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-seriesId">Series</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={bookForm.seriesId || "none"}
                                        onValueChange={(value) => {
                                            if (value === "none") {
                                                setBookForm({ ...bookForm, seriesId: "" });
                                            } else {
                                                setBookForm({ ...bookForm, seriesId: value });
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn series">
                                                {bookForm.seriesId
                                                    ? series.find(s => s.id.toString() === bookForm.seriesId)?.name || "Chọn series"
                                                    : "Không có series"
                                                }
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Không có series</SelectItem>
                                            {series.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {bookForm.seriesId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setBookForm({ ...bookForm, seriesId: "" })}
                                            className="shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Categories Multi-select */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-categories">Danh mục *</Label>
                            <Select
                                value={bookForm.categoryIds[0] || ""}
                                onValueChange={(value) => {
                                    if (value && !bookForm.categoryIds.includes(value)) {
                                        setBookForm({
                                            ...bookForm,
                                            categoryIds: [...bookForm.categoryIds, value]
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                            disabled={bookForm.categoryIds.includes(category.id.toString())}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {bookForm.categoryIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {bookForm.categoryIds.map((catId) => {
                                        const category = categories.find(c => c.id.toString() === catId);
                                        return (
                                            <Badge key={catId} variant="secondary" className="gap-1">
                                                {category?.name || catId}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBookForm({
                                                            ...bookForm,
                                                            categoryIds: bookForm.categoryIds.filter(id => id !== catId)
                                                        });
                                                    }}
                                                    className="ml-1 hover:text-destructive"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Book Image Upload Component */}
                        <BookImageUpload
                            ref={imageUploadRef}
                            coverImagePreview={coverImagePreview}
                            setCoverImagePreview={setCoverImagePreview}
                            additionalImagesPreviews={additionalImagesPreviews}
                            setAdditionalImagesPreviews={setAdditionalImagesPreviews}
                            setCoverImageFile={setCoverImageFile}
                            setAdditionalImagesFiles={setAdditionalImagesFiles}
                        />

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Mô tả</Label>
                            <Textarea
                                id="edit-description"
                                value={bookForm.description}
                                onChange={(e) =>
                                    setBookForm({ ...bookForm, description: e.target.value })
                                }
                                placeholder="Nhập mô tả sách"
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={
                                updateMutation.isPending ||
                                isUploadingImages ||
                                !bookForm.title ||
                                !bookForm.author ||
                                !bookForm.price
                            }
                        >
                            {updateMutation.isPending || isUploadingImages ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mr-2" />
                                    {isUploadingImages ? "Đang tải ảnh..." : "Đang cập nhật..."}
                                </>
                            ) : (
                                "Cập nhật"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sách "{selectedBook?.title}"? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
