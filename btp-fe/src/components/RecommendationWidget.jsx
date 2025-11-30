import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recomendApi } from "@/api";
import useCustomMutation from "@/hooks/useCustomMutation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Sparkles,
    Send,
    BookOpen,
    Lightbulb,
    X,
    MessageCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const RecommendationWidget = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Get recommendations mutation
    const getRecommendationsMutation = useCustomMutation(
        (desc) => recomendApi.getRecomendations(desc),
        null,
        {
            onSuccess: (response) => {
                const data = response?.data || response || [];
                setRecommendations(data);
                setHasSearched(true);
                if (data.length === 0) {
                    toast.error("Không tìm thấy sách phù hợp");
                } else {
                    toast.success(`Tìm thấy ${data.length} gợi ý sách cho bạn!`);
                }
            },
            onError: (error) => {
                toast.error(error?.message || "Không thể lấy gợi ý sách");
                setRecommendations([]);
                setHasSearched(true);
            },
        }
    );

    const handleGetRecommendations = () => {
        if (!description.trim()) {
            toast.error("Vui lòng nhập mô tả về loại sách bạn muốn tìm");
            return;
        }

        setHasSearched(false);
        getRecommendationsMutation.mutate(description);
    };

    const handleViewBook = (bookId) => {
        navigate(`/books/${bookId}`);
        setIsOpen(false);
    };

    const handleClear = () => {
        setDescription("");
        setRecommendations([]);
        setHasSearched(false);
    };

    return (
        <>
            {/* Floating Widget Button */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <Button
                    size="lg"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300"
                >
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Sparkles className="w-6 h-6" />
                    )}
                </Button>
            </motion.div>

            {/* Widget Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-full max-w-md"
                    >
                        <Card className="shadow-2xl border-2 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white">
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" />
                                    Gợi Ý Sách Cho Bạn
                                </CardTitle>
                                <CardDescription className="text-white/90">
                                    Mô tả loại sách bạn muốn tìm, AI sẽ gợi ý cho bạn
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                                {/* Input Section */}
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <MessageCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                        <Textarea
                                            placeholder="Ví dụ: Tôi muốn tìm sách về lập trình Python dành cho người mới bắt đầu..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            disabled={getRecommendationsMutation.isPending}
                                            className="min-h-[100px] resize-none"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && e.ctrlKey) {
                                                    handleGetRecommendations();
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleGetRecommendations}
                                            disabled={getRecommendationsMutation.isPending || !description.trim()}
                                            className="flex-1 gap-2"
                                        >
                                            {getRecommendationsMutation.isPending ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Đang tìm...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Tìm kiếm
                                                </>
                                            )}
                                        </Button>
                                        {(recommendations.length > 0 || hasSearched) && (
                                            <Button
                                                onClick={handleClear}
                                                variant="outline"
                                                disabled={getRecommendationsMutation.isPending}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <p className="text-xs text-muted-foreground text-center">
                                        Nhấn Ctrl + Enter để tìm kiếm nhanh
                                    </p>
                                </div>

                                {/* Loading State */}
                                {getRecommendationsMutation.isPending && (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <Card key={i} className="overflow-hidden">
                                                <CardContent className="p-4">
                                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                                    <Skeleton className="h-3 w-full mb-1" />
                                                    <Skeleton className="h-3 w-5/6" />
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {/* Results Section */}
                                {!getRecommendationsMutation.isPending && hasSearched && (
                                    <>
                                        {recommendations.length > 0 ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-semibold">
                                                        Tìm thấy {recommendations.length} gợi ý
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    {recommendations.map((book, index) => (
                                                        <motion.div
                                                            key={book.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <Card
                                                                className="hover:shadow-md transition-all cursor-pointer border hover:border-primary/50 overflow-hidden group"
                                                                onClick={() => handleViewBook(book.id)}
                                                            >
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-colors">
                                                                            <BookOpen className="w-5 h-5 text-primary" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                                                                {book.title}
                                                                            </h4>
                                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                                {book.description}
                                                                            </p>
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="mt-2 text-xs"
                                                                            >
                                                                                Xem chi tiết →
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <Alert className="bg-orange-50 border-orange-200">
                                                <AlertDescription className="text-sm text-orange-800">
                                                    Không tìm thấy sách phù hợp. Hãy thử mô tả chi tiết hơn!
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </>
                                )}

                                {/* Empty State */}
                                {!getRecommendationsMutation.isPending && !hasSearched && (
                                    <div className="text-center py-8 space-y-3">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                            <Sparkles className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Sẵn sàng tìm sách!</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Mô tả loại sách bạn muốn và để AI gợi ý
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default RecommendationWidget;

