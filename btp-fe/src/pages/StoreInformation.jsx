import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookRating from "@/components/BookRating";
import { sellerApi, bookApi, cartApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    Store,
    MapPin,
    Phone,
    Mail,
    Globe,
    Home,
    Search,
    ShoppingCart,
    Package,
    Star,
    TrendingUp,
    Clock,
} from "lucide-react";

export default function StoreInformation() {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const { userId } = useAuthStore();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // Fetch seller data
    const { data: sellerData, isLoading: sellerLoading } = useCustomQuery(
        ["seller", sellerId],
        () => sellerApi.getSellerById(sellerId),
        {
            enabled: !!sellerId,
            onError: () => {
                toast.error("Không thể tải thông tin cửa hàng");
                navigate("/");
            },
        }
    );

    // Fetch books by seller
    const { data: booksData, isLoading: booksLoading } = useCustomQuery(
        ["sellerBooks", sellerId],
        () => bookApi.getBookBySeller(sellerId),
        {
            enabled: !!sellerId,
        }
    );

    // Add to cart mutation
    const addToCartMutation = useCustomMutation(
        (data) => cartApi.addToCart(data),
        null,
        {
            onSuccess: () => {
                toast.success("Đã thêm sách vào giỏ hàng!");
                queryClient.invalidateQueries(["cart", userId]);
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể thêm vào giỏ hàng");
            },
        }
    );

    // Process data
    const seller = sellerData?.data || sellerData;
    const books = useMemo(() => {
        const booksArray = Array.isArray(booksData?.data)
            ? booksData.data
            : Array.isArray(booksData)
            ? booksData
            : [];
        return booksArray.filter((book) => book.active);
    }, [booksData]);

    // Filter and sort books
    const filteredBooks = useMemo(() => {
        let filtered = [...books];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (book) =>
                    book.title?.toLowerCase().includes(query) ||
                    book.author?.toLowerCase().includes(query) ||
                    book.categoryNames?.some((cat) => cat.toLowerCase().includes(query))
            );
        }

        // Sort books
        switch (sortBy) {
            case "newest":
                filtered.sort((a, b) => b.id - a.id);
                break;
            case "price-asc":
                filtered.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                filtered.sort((a, b) => b.price - a.price);
                break;
            case "popular":
                filtered.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
                break;
            case "rating":
                // Sort by rating would need rating data
                break;
            default:
                break;
        }

        return filtered;
    }, [books, searchQuery, sortBy]);

    const handleAddToCart = (book, event) => {
        if (event) {
            event.stopPropagation();
        }

        if (!userId) {
            toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
            return;
        }

        const isOutOfStock = book.stock === 0 || book.stock === null;
        if (isOutOfStock) {
            toast.error("Sản phẩm đã hết hàng");
            return;
        }

        addToCartMutation.mutate({
            userId: userId,
            cartItems: [
                {
                    bookId: book.id || book._id,
                    quantity: 1,
                },
            ],
        });
    };

    // Calculate store stats
    const storeStats = useMemo(() => {
        const totalBooks = books.length;
        const totalSold = books.reduce((sum, book) => sum + (book.soldCount || 0), 0);
        const inStockBooks = books.filter((book) => book.stock > 0).length;

        return {
            totalBooks,
            totalSold,
            inStockBooks,
        };
    }, [books]);

    if (sellerLoading || booksLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Skeleton className="h-64 w-full mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-96 w-full" />
                        ))}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col justify-center items-center h-[60vh] text-center px-4">
                    <Store className="w-20 h-20 text-muted-foreground mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Không tìm thấy cửa hàng</h2>
                    <p className="text-muted-foreground mb-6">
                        Cửa hàng này không tồn tại hoặc đã bị gỡ bỏ
                    </p>
                    <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Breadcrumb */}
            <div className="border-b bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/" className="flex items-center gap-1">
                                    <Home className="w-4 h-4" />
                                    Trang chủ
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="flex items-center gap-1">
                                    <Store className="w-4 h-4" />
                                    {seller.storeName}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            {/* Store Header */}
            <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="overflow-hidden border-2">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Store Avatar */}
                                    <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                                        <AvatarImage src={seller.profileImage} alt={seller.storeName} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                                            {seller.storeName?.charAt(0)?.toUpperCase() || "S"}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Store Information */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                                                    {seller.storeName}
                                                    <Badge className="bg-primary text-lg px-3 py-1">
                                                        Cửa hàng chính thức
                                                    </Badge>
                                                </h1>
                                                <p className="text-muted-foreground text-lg">
                                                    {seller.storeDescription || "Chào mừng đến với cửa hàng của chúng tôi"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            {seller.storeAddress && (
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Địa chỉ</p>
                                                        <p className="font-medium">{seller.storeAddress}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {seller.phone && (
                                                <div className="flex items-start gap-3">
                                                    <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                                        <p className="font-medium">{seller.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {seller.email && (
                                                <div className="flex items-start gap-3">
                                                    <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Email</p>
                                                        <p className="font-medium">{seller.email}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {seller.website && (
                                                <div className="flex items-start gap-3">
                                                    <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Website</p>
                                                        <a
                                                            href={seller.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium text-primary hover:underline"
                                                        >
                                                            {seller.website}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Store Stats */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-muted/50 rounded-lg p-4 text-center">
                                                <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
                                                <p className="text-2xl font-bold">{storeStats.totalBooks}</p>
                                                <p className="text-sm text-muted-foreground">Sản phẩm</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-lg p-4 text-center">
                                                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                                                <p className="text-2xl font-bold">{storeStats.totalSold}</p>
                                                <p className="text-sm text-muted-foreground">Đã bán</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-lg p-4 text-center">
                                                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                                <p className="text-2xl font-bold">{storeStats.inStockBooks}</p>
                                                <p className="text-sm text-muted-foreground">Còn hàng</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Books Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm sách theo tên, tác giả, danh mục..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Mới nhất</SelectItem>
                            <SelectItem value="popular">Bán chạy nhất</SelectItem>
                            <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                            <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-muted-foreground">
                        Hiển thị{" "}
                        <span className="font-semibold text-foreground">
                            {filteredBooks.length}
                        </span>{" "}
                        {searchQuery ? "kết quả tìm kiếm" : "sản phẩm"}
                    </p>
                </div>

                {/* Books Grid */}
                {filteredBooks.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Package className="w-20 h-20 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {searchQuery ? "Không tìm thấy sách" : "Chưa có sản phẩm nào"}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {searchQuery
                                    ? "Thử tìm kiếm với từ khóa khác"
                                    : "Cửa hàng chưa có sản phẩm nào"}
                            </p>
                            {searchQuery && (
                                <Button variant="outline" onClick={() => setSearchQuery("")}>
                                    Xóa tìm kiếm
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBooks.map((book, index) => {
                            const isOutOfStock = book.stock === 0 || book.stock === null;
                            return (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card
                                        className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full border-2 hover:border-primary ${
                                            isOutOfStock ? "opacity-75" : ""
                                        }`}
                                        onClick={() => navigate(`/books/${book.id}`)}
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                            <img
                                                src={
                                                    book.coverImage && book.coverImage !== "string"
                                                        ? book.coverImage
                                                        : "https://via.placeholder.com/300x400?text=No+Image"
                                                }
                                                alt={book.title}
                                                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                                                    isOutOfStock ? "grayscale" : ""
                                                }`}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            {isOutOfStock ? (
                                                <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0">
                                                    Hết hàng
                                                </Badge>
                                            ) : (
                                                book.stock &&
                                                book.stock <= 5 && (
                                                    <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-0 text-xs">
                                                        Chỉ còn {book.stock}
                                                    </Badge>
                                                )
                                            )}
                                            <BookRating bookId={book.id} />
                                        </div>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="line-clamp-2 text-base group-hover:text-primary transition-colors">
                                                {book.title}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {book.author}
                                            </p>
                                        </CardHeader>
                                        <CardFooter className="pt-0 flex items-center justify-between">
                                            <div>
                                                {book.price !== undefined && (
                                                    <p className="text-xl font-bold text-primary">
                                                        {Number(book.price).toLocaleString("vi-VN")}₫
                                                    </p>
                                                )}
                                                {book.soldCount > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Đã bán {book.soldCount}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => handleAddToCart(book, e)}
                                                disabled={addToCartMutation.isPending || isOutOfStock}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                {isOutOfStock ? "Hết" : "Mua"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}

