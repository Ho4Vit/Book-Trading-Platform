import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Sparkles } from "lucide-react";
import useCustomMutation from "@/hooks/useCustomMutation";
import { cartApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const MaybeYouLike = ({ relatedBooks }) => {
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

    if (!relatedBooks || relatedBooks.length === 0) {
        return null;
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-primary" />
                            Có thể bạn thích
                        </h2>
                        <p className="text-muted-foreground">Sách cùng danh mục với sản phẩm này</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedBooks.map((relatedBook, index) => {
                        const isRelatedOutOfStock = relatedBook.stock === 0 || relatedBook.stock === null;
                        return (
                            <motion.div
                                key={relatedBook.id || relatedBook._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className={`group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-2 hover:border-primary ${
                                        isRelatedOutOfStock ? "opacity-75" : ""
                                    }`}
                                    onClick={() => navigate(`/books/${relatedBook.id}`)}
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                        <img
                                            src={
                                                relatedBook.coverImage && relatedBook.coverImage !== "string"
                                                    ? relatedBook.coverImage
                                                    : "https://via.placeholder.com/300x400?text=No+Image"
                                            }
                                            alt={relatedBook.title}
                                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                                                isRelatedOutOfStock ? "grayscale" : ""
                                            }`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {isRelatedOutOfStock ? (
                                            <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0">
                                                Hết hàng
                                            </Badge>
                                        ) : (
                                            relatedBook.stock && relatedBook.stock <= 5 && (
                                                <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-0 text-xs">
                                                    Chỉ còn {relatedBook.stock}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="line-clamp-2 text-base group-hover:text-primary transition-colors">
                                            {relatedBook.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-1">
                                            {relatedBook.author}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardFooter className="pt-0 flex items-center justify-between">
                                        <div>
                                            {relatedBook.price !== undefined && (
                                                <p className="text-xl font-bold text-primary">
                                                    {Number(relatedBook.price).toLocaleString("vi-VN")}₫
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => handleQuickAddToCart(relatedBook, e)}
                                            disabled={addToCartMutation.isPending || isRelatedOutOfStock}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Mua
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </section>
    );
};

export default MaybeYouLike;

