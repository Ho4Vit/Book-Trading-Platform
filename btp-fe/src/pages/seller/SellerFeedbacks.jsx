import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { feedbackApi, bookApi, customerApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import {
    MessageSquare,
    Star,
    Search,
    BookOpen,
    Calendar,
    TrendingUp,
    Eye,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function SellerFeedbacks() {
    const { userId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBook, setSelectedBook] = useState("ALL");
    const [ratingFilter, setRatingFilter] = useState("ALL");
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    // Fetch seller's books
    const { data: booksData, isLoading: booksLoading } = useCustomQuery(
        ["sellerBooks", userId],
        () => bookApi.getBookBySeller(userId),
        {
            enabled: !!userId,
        }
    );

    // Fetch all feedbacks
    const { data: feedbacksData, isLoading: feedbacksLoading } = useCustomQuery(
        ["allFeedbacks"],
        () => feedbackApi.getFeedbackAll(),
        {
            refetchInterval: 30000,
        }
    );

    // Fetch feedback detail when selected
    const { data: feedbackDetailData, isLoading: detailLoading } = useCustomQuery(
        ["feedbackDetail", selectedFeedback?.id],
        () => feedbackApi.getFeedbackById(selectedFeedback?.id),
        {
            enabled: !!selectedFeedback?.id,
        }
    );

    // Fetch customer details for the selected feedback
    const { data: customerDetailData, isLoading: customerLoading } = useCustomQuery(
        ["customerDetail", selectedFeedback?.customerId],
        () => customerApi.getCustomerById(selectedFeedback?.customerId),
        {
            enabled: !!selectedFeedback?.customerId,
        }
    );

    // Fetch book details for the selected feedback
    const { data: bookDetailData, isLoading: bookLoading } = useCustomQuery(
        ["bookDetail", selectedFeedback?.bookId],
        () => bookApi.getBookById(selectedFeedback?.bookId),
        {
            enabled: !!selectedFeedback?.bookId,
        }
    );

    // Process seller's books
    const sellerBooks = useMemo(() => {
        const books = Array.isArray(booksData?.data)
            ? booksData.data
            : Array.isArray(booksData)
            ? booksData
            : [];

        return books;
    }, [booksData]);

    // Get seller's book IDs
    const sellerBookIds = useMemo(() => {
        return new Set(sellerBooks.map(book => book.id));
    }, [sellerBooks]);

    // Process feedbacks - filter by seller's books and enrich with book/customer data
    const allFeedbacks = useMemo(() => {
        const feedbacks = Array.isArray(feedbacksData?.data)
            ? feedbacksData.data
            : Array.isArray(feedbacksData)
            ? feedbacksData
            : [];

        // Filter only feedbacks for seller's books
        return feedbacks.filter(feedback => sellerBookIds.has(feedback.bookId));
    }, [feedbacksData, sellerBookIds]);

    // Enrich feedbacks with book and customer information
    const enrichedFeedbacks = useMemo(() => {
        return allFeedbacks.map(feedback => {
            // Find book info from seller's books
            const book = sellerBooks.find(b => b.id === feedback.bookId);

            return {
                ...feedback,
                bookName: book?.name || 'Sách không xác định',
                bookImage: book?.imgUrl,
            };
        });
    }, [allFeedbacks, sellerBooks]);

    // Filter feedbacks based on search, book, and rating
    const filteredFeedbacks = useMemo(() => {
        let filtered = enrichedFeedbacks;

        // Filter by book
        if (selectedBook !== "ALL") {
            filtered = filtered.filter(f => f.bookId === parseInt(selectedBook));
        }

        // Filter by rating
        if (ratingFilter !== "ALL") {
            filtered = filtered.filter(f => f.rating === parseInt(ratingFilter));
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(f =>
                f.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.bookName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort by newest first
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [enrichedFeedbacks, selectedBook, ratingFilter, searchQuery]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalFeedbacks = enrichedFeedbacks.length;
        const averageRating = totalFeedbacks > 0
            ? (enrichedFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1)
            : 0;

        const ratingDistribution = {
            5: enrichedFeedbacks.filter(f => f.rating === 5).length,
            4: enrichedFeedbacks.filter(f => f.rating === 4).length,
            3: enrichedFeedbacks.filter(f => f.rating === 3).length,
            2: enrichedFeedbacks.filter(f => f.rating === 2).length,
            1: enrichedFeedbacks.filter(f => f.rating === 1).length,
        };

        return {
            totalFeedbacks,
            averageRating,
            ratingDistribution,
        };
    }, [enrichedFeedbacks]);

    const handleViewDetail = (feedback) => {
        setSelectedFeedback(feedback);
        setDetailDialogOpen(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
        } catch {
            return dateString;
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                        }`}
                    />
                ))}
            </div>
        );
    };

    const isLoading = booksLoading || feedbacksLoading;

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Quản lý Đánh giá</h1>
                        <p className="text-muted-foreground">
                            Xem và quản lý đánh giá từ khách hàng
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                                <p className="text-2xl font-bold">{stats.totalFeedbacks}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Đánh giá trung bình</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold">{stats.averageRating}</p>
                                    <div className="flex gap-0.5">
                                        {renderStars(Math.round(stats.averageRating))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">5 sao</p>
                                <p className="text-2xl font-bold">{stats.ratingDistribution[5]}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rating Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Phân bố đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.ratingDistribution[rating];
                            const percentage = stats.totalFeedbacks > 0
                                ? (count / stats.totalFeedbacks) * 100
                                : 0;

                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="text-sm font-medium">{rating}</span>
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-12 text-right">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm đánh giá..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Book Filter */}
                        <Select value={selectedBook} onValueChange={setSelectedBook}>
                            <SelectTrigger>
                                <SelectValue placeholder="Lọc theo sách" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả sách</SelectItem>
                                {sellerBooks.map((book) => (
                                    <SelectItem key={book.id} value={book.id.toString()}>
                                        {book.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Rating Filter */}
                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Lọc theo sao" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả đánh giá</SelectItem>
                                <SelectItem value="5">5 sao</SelectItem>
                                <SelectItem value="4">4 sao</SelectItem>
                                <SelectItem value="3">3 sao</SelectItem>
                                <SelectItem value="2">2 sao</SelectItem>
                                <SelectItem value="1">1 sao</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Feedbacks List */}
            {filteredFeedbacks.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <MessageSquare className="w-20 h-20 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            {searchQuery || selectedBook !== "ALL" || ratingFilter !== "ALL"
                                ? "Không tìm thấy đánh giá"
                                : "Chưa có đánh giá nào"}
                        </h3>
                        <p className="text-muted-foreground">
                            {searchQuery || selectedBook !== "ALL" || ratingFilter !== "ALL"
                                ? "Thử điều chỉnh bộ lọc để xem kết quả khác"
                                : "Khách hàng chưa để lại đánh giá cho sản phẩm của bạn"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredFeedbacks.map((feedback) => (
                        <Card
                            key={feedback.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleViewDetail(feedback)}
                        >
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    {/* Customer Avatar */}
                                    <Avatar className="h-12 w-12 border-2">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/9.x/identicon/svg?seed=${feedback.customerId}`}
                                            alt={feedback.customerId}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                                            {feedback.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">
                                                        Khách hàng #{feedback.customerId}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        <BookOpen className="w-3 h-3 mr-1" />
                                                        {feedback.bookName}
                                                    </Badge>
                                                </div>
                                                {renderStars(feedback.rating)}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(feedback.createdAt)}
                                            </div>
                                        </div>

                                        {/* Comment */}
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {feedback.content || "Không có bình luận"}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDetail(feedback);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                                Xem chi tiết
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Feedback Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            Chi tiết Đánh giá
                        </DialogTitle>
                        <DialogDescription>
                            Thông tin chi tiết về đánh giá từ khách hàng
                        </DialogDescription>
                    </DialogHeader>

                    {detailLoading || customerLoading || bookLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : feedbackDetailData ? (
                        <div className="space-y-4">
                            {/* Customer Info */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-16 w-16 border-2">
                                            <AvatarImage
                                                src={`${customerDetailData?.profileImage}`}
                                                alt={customerDetailData?.fullName || customerDetailData?.data?.fullName}
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xl">
                                                {(customerDetailData?.fullName || customerDetailData?.data?.fullName)?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">
                                                {customerDetailData?.fullName || customerDetailData?.data?.fullName || "Khách hàng"}
                                            </h3>
                                            {(customerDetailData?.email || customerDetailData?.data?.email) && (
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {customerDetailData?.email || customerDetailData?.data?.email}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mb-2">
                                                {renderStars(feedbackDetailData.rating)}
                                                <span className="text-sm text-muted-foreground">
                                                    {feedbackDetailData.rating}/5
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(feedbackDetailData.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Book Info */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <BookOpen className="w-5 h-5 text-primary" />
                                        <h4 className="font-semibold">Sản phẩm đánh giá</h4>
                                    </div>
                                    <div className="flex gap-3">
                                        {(bookDetailData?.coverImage || bookDetailData?.data?.coverImage) && (
                                            <img
                                                src={bookDetailData?.coverImage || bookDetailData?.data?.coverImage}
                                                alt={bookDetailData?.title || bookDetailData?.data?.title}
                                                className="w-16 h-20 object-cover rounded border"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium">{bookDetailData?.title || bookDetailData?.data?.title || 'Sách không xác định'}</p>
                                            {(bookDetailData?.author || bookDetailData?.data?.author) && (
                                                <p className="text-sm text-muted-foreground">
                                                    Tác giả: {bookDetailData?.author || bookDetailData?.data?.author}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Comment */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MessageSquare className="w-5 h-5 text-primary" />
                                        <h4 className="font-semibold">Nội dung đánh giá</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {feedbackDetailData.content || "Khách hàng không để lại bình luận"}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            Không thể tải thông tin đánh giá
                        </p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

