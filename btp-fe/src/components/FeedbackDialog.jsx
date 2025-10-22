import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { feedbackApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import useCustomMutation from "@/hooks/useCustomMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * FeedbackDialog Component
 * A reusable dialog for submitting book feedback/ratings
 *
 * @param {Object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {function} props.onOpenChange - Callback when dialog open state changes
 * @param {Object} props.book - The book object being reviewed
 */
export default function FeedbackDialog({ open, onOpenChange, book }) {
    const { userId } = useAuthStore();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [content, setContent] = useState("");
    const [existingFeedback, setExistingFeedback] = useState(null);

    // Fetch all feedbacks to check if user already reviewed this book
    const { data: feedbacksData } = useCustomQuery(
        ["allFeedbacks"],
        () => feedbackApi.getFeedbackAll(),
        {
            enabled: open && !!book?.bookId && !!userId,
        }
    );

    // Check for existing feedback when dialog opens or data changes
    useEffect(() => {
        if (open && book?.bookId && userId && feedbacksData) {
            const feedbacks = Array.isArray(feedbacksData?.data)
                ? feedbacksData.data
                : Array.isArray(feedbacksData)
                ? feedbacksData
                : [];

            const existing = feedbacks.find(
                (f) => f.bookId === book.bookId && f.customerId === Number(userId)
            );

            if (existing) {
                setExistingFeedback(existing);
                setRating(existing.rating || 0);
                setContent(existing.content || "");
            } else {
                setExistingFeedback(null);
                setRating(0);
                setContent("");
            }
        }
    }, [open, book?.bookId, userId, feedbacksData]);

    // Create feedback mutation
    const createFeedbackMutation = useCustomMutation(
        (data) => feedbackApi.feedbackCreate(data),
        null,
        {
            onSuccess: () => {
                toast.success(
                    existingFeedback
                        ? "Đánh giá của bạn đã được cập nhật thành công!"
                        : "Đánh giá của bạn đã được gửi thành công!"
                );
                handleClose();
                // Invalidate queries to refresh data
                queryClient.invalidateQueries(["customerOrders", userId]);
                queryClient.invalidateQueries(["bookRating", book?.bookId]);
                queryClient.invalidateQueries(["customerFeedbacks", userId]);
                queryClient.invalidateQueries(["allFeedbacks"]);
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể gửi đánh giá. Vui lòng thử lại!");
            },
        }
    );

    // Delete feedback mutation (for updating - delete old then create new)
    const deleteFeedbackMutation = useCustomMutation(
        (id) => feedbackApi.deleteFeedback(id),
        null,
        {
            onSuccess: () => {
                // After deleting, create new feedback
                createFeedbackMutation.mutate({
                    bookId: book?.bookId,
                    customerId: userId,
                    rating: rating,
                    content: content.trim(),
                    visible: true,
                });
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể cập nhật đánh giá. Vui lòng thử lại!");
            },
        }
    );

    const handleClose = () => {
        setRating(0);
        setHoverRating(0);
        setContent("");
        setExistingFeedback(null);
        onOpenChange(false);
    };

    const handleSubmit = () => {
        if (!rating) {
            toast.error("Vui lòng chọn số sao đánh giá");
            return;
        }

        if (!content.trim()) {
            toast.error("Vui lòng nhập nhận xét của bạn");
            return;
        }

        // If updating existing feedback, delete first then create
        if (existingFeedback) {
            deleteFeedbackMutation.mutate(existingFeedback.id);
        } else {
            createFeedbackMutation.mutate({
                bookId: book?.bookId,
                customerId: userId,
                rating: rating,
                content: content.trim(),
                visible: true,
            });
        }
    };

    const isLoading = createFeedbackMutation.isPending || deleteFeedbackMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {existingFeedback ? "Cập nhật đánh giá sách" : "Đánh giá sách"}: {book?.bookName}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {existingFeedback
                            ? "Chỉnh sửa đánh giá của bạn về cuốn sách này"
                            : "Chia sẻ trải nghiệm của bạn về cuốn sách này"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {existingFeedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                            <p className="text-sm text-blue-800">
                                <strong>Lưu ý:</strong> Bạn đã đánh giá sách này trước đó. Thay đổi của bạn sẽ cập nhật đánh giá cũ.
                            </p>
                        </div>
                    )}

                    {/* Rating Stars */}
                    <div>
                        <Label className="block text-sm font-medium mb-2">
                            Đánh giá của bạn <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-all hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= (hoverRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                                {rating === 1 && "Rất tệ"}
                                {rating === 2 && "Tệ"}
                                {rating === 3 && "Trung bình"}
                                {rating === 4 && "Tốt"}
                                {rating === 5 && "Xuất sắc"}
                            </p>
                        )}
                    </div>

                    {/* Review Content */}
                    <div>
                        <Label htmlFor="content" className="block text-sm font-medium mb-2">
                            Nhận xét của bạn <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Chia sẻ những gì bạn thích hoặc không thích về cuốn sách này..."
                            className="resize-none"
                            rows={5}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                            {content.length}/500 ký tự
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? (existingFeedback ? "Đang cập nhật..." : "Đang gửi...")
                            : (existingFeedback ? "Cập nhật đánh giá" : "Gửi đánh giá")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
