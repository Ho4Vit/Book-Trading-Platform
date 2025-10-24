import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { bookApi } from "@/api";
import { cartApi } from "@/api/cartApi";
import Footer from "@/components/Footer.jsx";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import Header from "@/components/Header.jsx";
import SearchBar from "@/components/SearchBar.jsx";
import BookRating from "@/components/BookRating.jsx";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import {
	BookOpen,
	TrendingUp,
	Sparkles,
	ArrowRight,
	ShoppingCart,
	Star,
	Package,
	Zap,
	Heart,
} from "lucide-react";


export default function HomePage() {
	const navigate = useNavigate();
	const { userId } = useAuthStore();
	const queryClient = useQueryClient();

	// Fetch books data
	const { data: booksData, isLoading } = useCustomQuery(
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

	// Process data
	const books = Array.isArray(booksData?.data)
		? booksData.data
		: Array.isArray(booksData)
		? booksData
		: [];

	const featuredBooks = books.slice(0, 4);

	// Sort books by soldCount for trending section
	const trendingBooks = [...books]
		.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
		.slice(0, 8);

	// Handle add to cart
	const handleAddToCart = (book, event) => {
		if (event) {
			event.stopPropagation();
		}

		// Check if user is logged in
		if (!userId) {
			toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
			return;
		}

		// Add to cart
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

	const categories = [
		{ name: "Văn học", icon: BookOpen, color: "bg-gradient-to-br from-blue-500 to-cyan-500", count: 150 },
		{ name: "Kinh tế", icon: TrendingUp, color: "bg-gradient-to-br from-green-500 to-emerald-500", count: 89 },
		{ name: "Công nghệ", icon: Zap, color: "bg-gradient-to-br from-purple-500 to-pink-500", count: 120 },
		{ name: "Thiếu nhi", icon: Heart, color: "bg-gradient-to-br from-orange-500 to-red-500", count: 95 },
	];

	const features = [
		{ icon: Package, title: "Giao hàng nhanh", desc: "Nhận sách trong 2-3 ngày" },
		{ icon: Star, title: "Cam kết chất lượng", desc: "Sách chính hãng 100%" },
		{ icon: Heart, title: "Yêu thích nhiều", desc: "Hơn 50,000+ khách hàng" },
		{ icon: Zap, title: "Ưu đãi hấp dẫn", desc: "Giảm giá mỗi ngày" },
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<Header />

			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 pt-20 pb-32">
				{/* Background Pattern */}
				<div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.1))]" />

				{/* Animated Blobs */}
				<div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
				<div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
				<div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center space-y-8">
						{/* Badge */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<Badge variant="secondary" className="mb-6 px-6 py-2 text-sm font-medium">
								<Sparkles className="w-4 h-4 mr-2" />
								Nền tảng sách trực tuyến #1 tại Việt Nam
							</Badge>
						</motion.div>

						{/* Heading */}
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1, duration: 0.6 }}
							className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight"
						>
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600">
								Khám phá
							</span>
							<br />
							<span className="text-foreground">Tri thức vô tận</span>
						</motion.h1>

						{/* Description */}
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.6 }}
							className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
						>
							Mua bán và trao đổi hàng ngàn đầu sách chất lượng
							<br />
							từ cộng đồng yêu sách khắp cả nước
						</motion.p>

						{/* Search Bar */}
						<motion.div
							id="search-section"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.6 }}
							className="max-w-2xl mx-auto"
						>
							<SearchBar className="w-full" />
						</motion.div>

						{/* CTA Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.6 }}
							className="flex flex-wrap items-center justify-center gap-4"
						>
							<Button
                                onClick={() => navigate("/category/all")}
                                size="lg" className="group gap-2 px-8 h-12 text-base font-semibold shadow-lg">
								<BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
								Khám phá ngay
								<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</Button>
							<Button
                               onClick={() => navigate("/register-seller")}
                                size="lg" variant="outline" className="gap-2 px-8 h-12 text-base font-semibold">
								Bán sách của bạn
							</Button>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{features.map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
										<feature.icon className="w-6 h-6 text-primary" />
									</div>
									<h3 className="font-semibold mb-1">{feature.title}</h3>
									<p className="text-sm text-muted-foreground">{feature.desc}</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</section>

			{/* Categories Section */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">Danh mục nổi bật</h2>
					<p className="text-lg text-muted-foreground">
						Khám phá theo chủ đề bạn yêu thích
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
					{categories.map((category, index) => {
						const Icon = category.icon;
						return (
							<motion.div
								key={category.name}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="group relative overflow-hidden cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
									<CardContent className="p-8 text-center">
										<div className={`${category.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
											<Icon className="w-10 h-10 text-white" />
										</div>
										<h3 className="text-xl font-bold mb-2">{category.name}</h3>
										<p className="text-sm text-muted-foreground">
											{category.count} cuốn sách
										</p>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</section>

			{/* Featured Books Section */}
			<section className="bg-muted/50 py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between mb-12">
						<div>
							<h2 className="text-4xl font-bold mb-2">Sách nổi bật</h2>
							<p className="text-lg text-muted-foreground">
								Những đầu sách được yêu thích nhất
							</p>
						</div>
						<Button variant="outline" className="gap-2 hidden md:flex">
							Xem tất cả
							<ArrowRight className="w-4 h-4" />
						</Button>
					</div>

					{isLoading ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
							{[...Array(4)].map((_, i) => (
								<Card key={i} className="overflow-hidden">
									<Skeleton className="h-80 w-full" />
									<CardHeader>
										<Skeleton className="h-6 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
									</CardHeader>
									<CardFooter>
										<Skeleton className="h-10 w-full" />
									</CardFooter>
								</Card>
							))}
						</div>
					) : featuredBooks.length === 0 ? (
						<Card className="p-16 text-center">
							<BookOpen className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-2xl font-bold mb-2">Chưa có sách nào</h3>
							<p className="text-muted-foreground">
								Hãy quay lại sau để khám phá thêm sách mới
							</p>
						</Card>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
							{featuredBooks.map((book, index) => {
								const isOutOfStock = book.stock === 0 || book.stock === null;
								return (
									<motion.div
										key={book.id || book._id}
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
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
													<>
														<Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
															<Star className="w-3 h-3 mr-1" />
															Mới
														</Badge>
														{book.stock && book.stock <= 5 && (
															<Badge className="absolute top-12 right-3 bg-orange-500 text-white border-0 text-xs">
																Chỉ còn {book.stock}
															</Badge>
														)}
													</>
												)}
												<BookRating bookId={book.id || book._id} />
											</div>
										<CardHeader className="pb-3">
											<CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors h-14">
												{book.title}
											</CardTitle>
											<CardDescription className="line-clamp-1">
												{book.author}
											</CardDescription>
										</CardHeader>
											<CardFooter className="pt-0 flex items-center justify-between">
												<div>
													{book.price !== undefined && (
														<p className="text-2xl font-bold text-primary">
															{Number(book.price).toLocaleString("vi-VN")}đ
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
													{isOutOfStock ? "Hết hàng" : "Mua"}
												</Button>
											</CardFooter>
										</Card>
									</motion.div>
								);
							})}
						</div>
					)}
				</div>
			</section>

			{/* Trending Books Section */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
				<div className="flex items-center justify-between mb-12">
					<div>
						<h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
							<TrendingUp className="w-10 h-10 text-orange-500" />
							Xu hướng
						</h2>
						<p className="text-lg text-muted-foreground">
							Sách đang được mua nhiều nhất hiện nay
						</p>
					</div>
				</div>

				{!isLoading && trendingBooks.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
						{trendingBooks.map((book, index) => {
							const isOutOfStock = book.stock === 0 || book.stock === null;
							return (
								<motion.div
									key={book.id || book._id}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: index * 0.1 }}
								>
									<Card
										className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full border-2 hover:border-orange-500 ${
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
												<Badge className="absolute top-3 left-3 bg-red-500 text-white border-0">
													Hết hàng
												</Badge>
											) : (
												<>
													<Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 animate-pulse">
														<TrendingUp className="w-3 h-3 mr-1" />
														Hot
													</Badge>
													{book.stock && book.stock <= 5 && (
														<Badge className="absolute top-12 left-3 bg-red-500 text-white border-0 text-xs animate-pulse">
															Chỉ còn {book.stock}
														</Badge>
													)}
												</>
											)}
											<BookRating bookId={book.id || book._id} />
										</div>
										<CardHeader className="pb-3">
											<CardTitle className="line-clamp-2 text-lg group-hover:text-orange-500 transition-colors h-14">
												{book.title}
											</CardTitle>
											<CardDescription className="line-clamp-1">
												{book.author}
											</CardDescription>
										</CardHeader>
										<CardFooter className="pt-0 flex items-center justify-between">
											<div>
												{book.price !== undefined && (
													<p className="text-2xl font-bold text-primary">
														{Number(book.price).toLocaleString("vi-VN")}đ
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
												{isOutOfStock ? "Hết hàng" : "Mua"}
											</Button>
										</CardFooter>
									</Card>
								</motion.div>
							);
						})}
					</div>
				)}
			</section>

			{/* Footer */}
			<Footer />
		</div>
	);
}
