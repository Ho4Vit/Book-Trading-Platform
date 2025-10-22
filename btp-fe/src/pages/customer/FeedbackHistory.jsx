import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { feedbackApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Star, Trash2, MessageSquare, Home, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function FeedbackHistory() {
    const { userId } = useAuthStore();
    const queryClient = useQueryClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // Fetch all feedbacks and filter by customer
    const { data: feedbacksData, isLoading } = useCustomQuery(
        ["customerFeedbacks", userId],
        () => feedbackApi.getFeedbackAll(),
        {
            enabled: !!userId,
            select: (data) => {
                const feedbacks = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
                return feedbacks.filter((feedback) => feedback.customerId === Number(userId));
            },
        }
    );

    // Delete feedback mutation
    const deleteFeedbackMutation = useCustomMutation(
        (id) => feedbackApi.deleteFeedback(id),
        null,
        {
            onSuccess: () => {
                toast.success("Đã xóa đánh giá thành công!");
                setDeleteDialogOpen(false);
                setSelectedFeedback(null);
                queryClient.invalidateQueries(["customerFeedbacks", userId]);
                queryClient.invalidateQueries(["bookRating"]);
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể xóa đánh giá!");
            },
        }
    );

    const handleDeleteClick = (feedback) => {
        setSelectedFeedback(feedback);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedFeedback) {
            deleteFeedbackMutation.mutate(selectedFeedback.id);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
        } catch (error) {
            return dateString;
        }
    };

    const feedbacks = feedbacksData || [];

    if (isLoading) {
        return (
            <div className="w-full space-y-6">
                <Skeleton className="h-12 w-full" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
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
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Đánh giá của tôi</h1>
                        <p className="text-muted-foreground">
                            Quản lý các đánh giá bạn đã gửi
                        </p>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Home className="w-4 h-4" />
                            Trang chủ
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/customer" className="flex items-center gap-1 hover:text-primary transition-colors">
                            <User className="w-4 h-4" />
                            Tài khoản
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Đánh giá của tôi
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Feedbacks List */}
            {feedbacks.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <MessageSquare className="w-20 h-20 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Chưa có đánh giá nào</h3>
                        <p className="text-muted-foreground mb-6">
                            Hãy mua sách và để lại đánh giá sau khi nhận hàng
                        </p>
                        <Button onClick={() => window.location.href = "/"}>
                            Khám phá sản phẩm
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Tổng cộng: <span className="font-semibold text-foreground">{feedbacks.length}</span> đánh giá
                    </p>
                    {feedbacks.map((feedback, index) => (
                        <motion.div
                            key={feedback.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="text-base">
                                                    Đánh giá #{feedback.id}
                                                </CardTitle>
                                                {feedback.visible ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Hiển thị
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                                        Ẩn
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{formatDate(feedback.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${
                                                                i < feedback.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="ml-1 font-medium text-foreground">
                                                        {feedback.rating}/5
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteClick(feedback)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">
                                                Nội dung đánh giá:
                                            </p>
                                            <p className="text-foreground leading-relaxed">
                                                {feedback.content}
                                            </p>
                                        </div>
                                        {feedback.bookId && (
                                            <div className="pt-2 border-t">
                                                <p className="text-xs text-muted-foreground">
                                                    Sách ID: #{feedback.bookId}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteFeedbackMutation.isPending}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleteFeedbackMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteFeedbackMutation.isPending ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

