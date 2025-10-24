import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { bookApi, cartApi, sellerApi, feedbackApi } from "@/api";
import toast from "react-hot-toast";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MaybeYouLike from "@/components/MaybeYouLike";
import ExploreMore from "@/components/ExploreMore";
import {
    Store,
    MapPin,
    ChevronRight,
    ShoppingCart,
    Heart,
    Star,
    Package,
    Truck,
    Shield,
    BookOpen,
    TrendingUp,
    Home
} from "lucide-react";

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId } = useAuthStore();
    const queryClient = useQueryClient();
    const [selectedImage, setSelectedImage] = useState("");

    // Fetch book data using useCustomQuery
    const { data: bookResponse, isLoading, isError } = useCustomQuery(
        ["book", id],
        () => bookApi.getBookById(id),
        {
            enabled: !!id,
            onSuccess: (data) => {
                if (data?.data) {
                    // Check if book is active
                    if (!data.data.active) {
                        toast.error("Sách này không còn khả dụng");
                        navigate("/");
                    } else {
                        setSelectedImage(data.data.coverImage);
                    }
                }
            },
            onError: () => {
                toast.error("Không thể tải thông tin sách");
                navigate("/");
            }
        }
    );

    const book = bookResponse?.data || bookResponse;

    // Fetch seller data using useCustomQuery
    const { data: sellerResponse, isLoading: isSellerLoading } = useCustomQuery(
        ["seller", book?.sellerId],
        () => sellerApi.getSellerById(book?.sellerId),
        {
            enabled: !!book?.sellerId,
        }
    );

    const seller = sellerResponse?.data || sellerResponse;

    // Fetch average rating for the book
    const { data: ratingData } = useCustomQuery(
        ["bookRating", book?.id],
        () => feedbackApi.getAverageRating(book?.id),
        {
            enabled: !!book?.id,
            staleTime: 1000 * 60 * 5,
        }
    );

    const averageRating = ratingData?.data?.averageRating || ratingData?.averageRating || 0;
    const ratingCount = ratingData?.data?.count || ratingData?.count || 0;

    // Fetch all books for related books section
    const { data: allBooksData } = useCustomQuery(
        ["books"],
        () => bookApi.getAllBooks(),
        { staleTime: 1000 * 60 * 5 }
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

    const handleAddToCart = () => {
        // Check if user is logged in
        if (!userId) {
            toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
            return;
        }

        if (book.stock > 0) {
            // Add to cart using the same pattern as HomePage
            addToCartMutation.mutate({
                userId: userId,
                cartItems: [
                    {
                        bookId: book.id || book._id,
                        quantity: 1,
                    },
                ],
            });
        } else {
            toast.error("Sản phẩm đã hết hàng");
        }
    };

    const handleAddToWishlist = () => {
        if (!userId) {
            toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
            return;
        }
        toast.success("Đã thêm vào danh sách yêu thích!");
    };

    const handleNavigateToStore = () => {
        if (seller?.id) {
            navigate(`/store/${seller.id}`);
        }
    };

    const handleQuickAddToCart = (bookItem, event) => {
        if (event) {
            event.stopPropagation();
        }

        if (!userId) {
            toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
            return;
        }

        addToCartMutation.mutate({
            userId: userId,
            cartItems: [
                {
                    bookId: bookItem.id || bookItem._id,
                    quantity: 1,
                },
            ],
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Skeleton className="h-6 w-64 mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-[600px] w-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (isError || !book || !book.active) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col justify-center items-center h-[60vh] text-center px-4">
                    <BookOpen className="w-20 h-20 text-muted-foreground mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Không tìm thấy sách</h2>
                    <p className="text-muted-foreground mb-6">Sách này không tồn tại hoặc đã bị gỡ bỏ</p>
                    <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
                </div>
                <Footer />
            </div>
        );
    }

    const isOutOfStock = book.stock === 0 || book.stock === null;

    // Process related books (same category)
    const allBooks = Array.isArray(allBooksData?.data) ? allBooksData.data : Array.isArray(allBooksData) ? allBooksData : [];
    const relatedBooks = allBooks.filter(b => {
        // Exclude current book
        if (b.id === book.id || b._id === book._id) return false;
        if (book.categoryNames && b.categoryNames) {
            return book.categoryNames.some(cat => b.categoryNames.includes(cat));
        }
        return false;
    }).slice(0, 4);

    // Get trending books for explore more section
    const trendingBooks = [...allBooks]
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 8);

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
                                <BreadcrumbLink href="/category/all">Sách</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="line-clamp-1">{book.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            {/* Book Detail Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column - Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="overflow-hidden border-2 sticky top-4">
                            <CardContent className="p-6">
                                <div className="aspect-[3/4] relative overflow-hidden rounded-xl bg-muted mb-4">
                                    <img
                                        src={selectedImage || book.coverImage}
                                        alt={book.title}
                                        className="w-full h-full object-contain"
                                    />
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Badge variant="destructive" className="text-lg py-2 px-4">
                                                Hết hàng
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Images */}
                                {book.additionalImages?.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2">
                                        <button
                                            onClick={() => setSelectedImage(book.coverImage)}
                                            className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImage === book.coverImage ? "border-primary ring-2 ring-primary" : "border-muted hover:border-primary/50"
                                            }`}
                                        >
                                            <img src={book.coverImage} alt="Main" className="w-full h-full object-cover" />
                                        </button>
                                        {book.additionalImages.slice(0, 4).map((img, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedImage(img)}
                                                className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                                                    selectedImage === img ? "border-primary ring-2 ring-primary" : "border-muted hover:border-primary/50"
                                                }`}
                                            >
                                                <img src={img} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right Column - Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        {/* Title & Rating */}
                        <div>
                            <h1 className="text-4xl font-bold mb-4 leading-tight">{book.title}</h1>
                            <div className="flex items-center gap-4 flex-wrap">
                                {averageRating > 0 ? (
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${
                                                    i < Math.floor(averageRating)
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : i < averageRating
                                                        ? "fill-yellow-400/50 text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {Number(averageRating).toFixed(1)} ({ratingCount} đánh giá)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-gray-300" />
                                        ))}
                                        <span className="ml-2 text-sm text-muted-foreground">Chưa có đánh giá</span>
                                    </div>
                                )}
                                <Separator orientation="vertical" className="h-5" />
                                <div className="flex items-center gap-2 text-sm">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{book.soldCount || 0} đã bán</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Card */}
                        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-primary">
                                        {Number(book.price).toLocaleString("vi-VN")}₫
                                    </span>
                                    {book.originalPrice && book.originalPrice > book.price && (
                                        <>
                                            <span className="text-xl text-muted-foreground line-through">
                                                {Number(book.originalPrice).toLocaleString("vi-VN")}₫
                                            </span>
                                            <Badge variant="destructive" className="ml-2">
                                                Giảm {Math.round((1 - book.price / book.originalPrice) * 100)}%
                                            </Badge>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seller Card */}
                        {seller && (
                            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all cursor-pointer" onClick={handleNavigateToStore}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-14 w-14 border-2 border-primary/20">
                                                <AvatarImage src={seller.profileImage} alt={seller.storeName} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                                    {seller.storeName?.charAt(0)?.toUpperCase() || 'S'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Store className="w-4 h-4 text-primary" />
                                                    <h3 className="font-bold text-lg">{seller.storeName}</h3>
                                                </div>
                                                {seller.storeAddress && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground line-clamp-1">{seller.storeAddress}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            Xem shop
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {isSellerLoading && (
                            <Card className="border-2">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-14 w-14 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Book Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Thông tin chi tiết</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Tác giả</p>
                                    <p className="font-medium">{book.author}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Ngôn ngữ</p>
                                    <p className="font-medium">{book.language}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Số trang</p>
                                    <p className="font-medium">{book.pageCount}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Hình thức</p>
                                    <p className="font-medium">{book.format == "PAPERBACK" ? "Bìa Mềm" : "Bìa Cứng"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Tồn kho</p>
                                    <p className={`font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
                                        {isOutOfStock ? "Hết hàng" : `${book.stock} sản phẩm`}
                                    </p>
                                </div>
                                {book.publishedYear && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Năm xuất bản</p>
                                        <p className="font-medium">{book.publishedYear}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Categories */}
                        {book.categoryNames?.length > 0 && (
                            <div>
                                <h3 className="font-semibold mb-3">Danh mục</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {book.categoryNames.map((category, idx) => (
                                        <Badge key={idx} variant="secondary" className="px-3 py-1">
                                            {category}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Benefits */}
                        <Card className="bg-muted/50">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Truck className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Miễn phí vận chuyển</p>
                                            <p className="text-xs text-muted-foreground">Đơn từ 150k</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Đảm bảo chính hãng</p>
                                            <p className="text-xs text-muted-foreground">100% nguyên bản</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Package className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Đổi trả dễ dàng</p>
                                            <p className="text-xs text-muted-foreground">Trong 7 ngày</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-3 sticky bottom-4 bg-background p-4 rounded-lg border-2 shadow-lg">
                            <Button
                                size="lg"
                                className="flex-1 gap-2 h-12 text-base font-semibold"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || addToCartMutation.isPending}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {addToCartMutation.isPending ? "Đang thêm..." : isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="gap-2 h-12 text-base font-semibold"
                                onClick={handleAddToWishlist}
                            >
                                <Heart className="w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Description Section */}
            {book.description && (
                <section className="bg-muted/30 border-y">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                        Mô tả sản phẩm
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                        {book.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Maybe You Like Section */}
            <MaybeYouLike relatedBooks={relatedBooks} />

            {/* Explore More Section */}
            <ExploreMore trendingBooks={trendingBooks} limit={4} showViewAll={true} />

            <Footer />
        </div>
    );
};

export default BookDetailPage;
