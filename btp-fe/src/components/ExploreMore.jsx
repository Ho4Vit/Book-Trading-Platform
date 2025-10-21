import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TrendingUp, ChevronRight } from "lucide-react";
import useCustomMutation from "@/hooks/useCustomMutation";
import { cartApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const ExploreMore = ({ trendingBooks, limit = 4, showViewAll = true }) => {
    const navigate = useNavigate();
    const { userId } = useAuthStore();
    const queryClient = useQueryClient();

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

    if (!trendingBooks || trendingBooks.length === 0) {
        return null;
    }

    const booksToShow = trendingBooks.slice(0, limit);

    return (
        <section className="bg-muted/50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                                <TrendingUp className="w-8 h-8 text-orange-500" />
                                Khám phá thêm
                            </h2>
                            <p className="text-muted-foreground">Những cuốn sách đang được yêu thích</p>
                        </div>
                        {showViewAll && (
                            <Button variant="outline" className="gap-2" onClick={() => navigate("/")}>
                                Xem tất cả
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {booksToShow.map((trendingBook, index) => {
                            const isTrendingOutOfStock = trendingBook.stock === 0 || trendingBook.stock === null;
                            return (
                                <div key={trendingBook.id || trendingBook._id}>
                                    <Card
                                        className={`group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-2 hover:border-orange-500 ${
                                            isTrendingOutOfStock ? "opacity-75" : ""
                                        }`}
                                        onClick={() => navigate(`/books/${trendingBook.id}`)}
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                            <img
                                                src={
                                                    trendingBook.coverImage && trendingBook.coverImage !== "string"
                                                        ? trendingBook.coverImage
                                                        : "https://via.placeholder.com/300x400?text=No+Image"
                                                }
                                                alt={trendingBook.title}
                                                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                                                    isTrendingOutOfStock ? "grayscale" : ""
                                                }`}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            {isTrendingOutOfStock ? (
                                                <Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">
                                                    Hết hàng
                                                </Badge>
                                            ) : (
                                                <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 animate-pulse">
                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                    Hot
                                                </Badge>
                                            )}
                                        </div>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="line-clamp-2 text-base group-hover:text-orange-500 transition-colors">
                                                {trendingBook.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-1">
                                                {trendingBook.author}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardFooter className="pt-0 flex items-center justify-between">
                                            <div>
                                                {trendingBook.price !== undefined && (
                                                    <p className="text-xl font-bold text-primary">
                                                        {Number(trendingBook.price).toLocaleString("vi-VN")}₫
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => handleQuickAddToCart(trendingBook, e)}
                                                disabled={addToCartMutation.isPending || isTrendingOutOfStock}
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                Mua
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ExploreMore;
