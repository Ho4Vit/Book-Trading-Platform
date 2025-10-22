import React, { useState, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { bookApi, categoryApi, sellerApi } from "@/api";
import { cartApi } from "@/api/cartApi";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookRating from "@/components/BookRating";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	BookOpen,
	Home,
	Filter,
	X,
	ShoppingCart,
	SlidersHorizontal,
	Grid3x3,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";


export default function CategoryBooks() {
	const { categoryId } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const { userId } = useAuthStore();
	const queryClient = useQueryClient();

	const categoryName = location.state?.categoryName || "Danh mục";

	// State for filters
	const [priceRange, setPriceRange] = useState([0, 1000000]);
	const [selectedFormats, setSelectedFormats] = useState([]);
	const [selectedLanguages, setSelectedLanguages] = useState([]);
	const [selectedSellers, setSelectedSellers] = useState([]);
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [sortBy, setSortBy] = useState("newest");
	const [showFilters, setShowFilters] = useState(true);

	// Fetch books
	const { data: booksData, isLoading: booksLoading } = useCustomQuery(
		["books"],
		() => bookApi.getAllBooks(),
		{ staleTime: 1000 * 60 * 5 }
	);

	// Fetch categories
    const { data: categoriesData, isLoading: categoriesLoading } = useCustomQuery(
        ["categories"],
        () => categoryApi.getAllCategories(),
        { staleTime: 1000 * 60 * 10 }
    );

	// Fetch sellers
	const { data: sellersData, isLoading: sellersLoading } = useCustomQuery(
		["sellers"],
		() => sellerApi.getAllSellers(),
		{ staleTime: 1000 * 60 * 10 }
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

	// Process books data with useMemo to prevent unnecessary re-renders
	const books = useMemo(() => {
		if (Array.isArray(booksData?.data)) {
			return booksData.data;
		}
		if (Array.isArray(booksData)) {
			return booksData;
		}
		return [];
	}, [booksData]);

	const categories = useMemo(() => {
		if (Array.isArray(categoriesData?.data)) {
			return categoriesData.data;
		}
		if (Array.isArray(categoriesData)) {
			return categoriesData;
		}
		return [];
	}, [categoriesData]);

	const sellers = useMemo(() => {
		if (Array.isArray(sellersData?.data)) {
			return sellersData.data;
		}
		if (Array.isArray(sellersData)) {
			return sellersData;
		}
		return [];
	}, [sellersData]);

	// Helper function to get seller store name by ID
	const getSellerStoreName = (sellerId) => {
		const seller = sellers.find((s) => s.id === sellerId);
		return seller?.storeName || "Không xác định";
	};

	// Get current category
	const currentCategory = useMemo(() => {
		return categories.find((cat) => cat.id === parseInt(categoryId));
	}, [categories, categoryId]);

	// Filter books by category
	const filteredBooks = useMemo(() => {
		let filtered = books;

		// Filter by category
		if (categoryId !== "all") {
            if (!currentCategory) {
                return [];
            }

            filtered = filtered.filter((book) =>
                book.categoryNames?.includes(currentCategory?.name)
            );
		}

		// Filter by additional categories (from sidebar filter)
		if (selectedCategories.length > 0) {
			filtered = filtered.filter((book) =>
				book.categoryNames?.some(catName => selectedCategories.includes(catName))
			);
		}

		// Filter by price range - handle undefined/null prices
		filtered = filtered.filter((book) => {
			const price = book.price ?? 0;
			return price >= priceRange[0] && price <= priceRange[1];
		});

		// Filter by format
		if (selectedFormats.length > 0) {
			filtered = filtered.filter((book) => selectedFormats.includes(book.format));
		}

		// Filter by language
		if (selectedLanguages.length > 0) {
			filtered = filtered.filter((book) => selectedLanguages.includes(book.language));
		}

		// Filter by sellers
		if (selectedSellers.length > 0) {
			filtered = filtered.filter((book) => selectedSellers.includes(book.sellerId));
		}

		// Sort books
		switch (sortBy) {
			case "newest":
				filtered = [...filtered].sort((a, b) => b.id - a.id);
				break;
			case "price-asc":
				filtered = [...filtered].sort((a, b) => a.price - b.price);
				break;
			case "price-desc":
				filtered = [...filtered].sort((a, b) => b.price - a.price);
				break;
			case "popular":
				filtered = [...filtered].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
				break;
			default:
				break;
		}

        return filtered;
    }, [books, categoryId, currentCategory, priceRange, selectedFormats, selectedLanguages, selectedSellers, selectedCategories, sortBy]);

	// Extract unique values for filters
	const availableFormats = useMemo(() => {
		return [...new Set(books.map((book) => book.format).filter(Boolean))];
	}, [books]);

	const availableLanguages = useMemo(() => {
		return [...new Set(books.map((book) => book.language).filter(Boolean))];
	}, [books]);

	const availableSellers = useMemo(() => {
		return [...new Set(books.map((book) => book.sellerId).filter(Boolean))];
	}, [books]);

	// Get available categories from books
	const availableCategories = useMemo(() => {
		const categorySet = new Set();
		books.forEach((book) => {
			if (book.categoryNames && Array.isArray(book.categoryNames)) {
				book.categoryNames.forEach(cat => categorySet.add(cat));
			}
		});
		return Array.from(categorySet);
	}, [books]);

	// Handle filter changes
	const toggleFormat = (format) => {
		setSelectedFormats((prev) =>
			prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
		);
	};

	const toggleLanguage = (language) => {
		setSelectedLanguages((prev) =>
			prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
		);
	};

	const toggleSeller = (sellerId) => {
		setSelectedSellers((prev) =>
			prev.includes(sellerId) ? prev.filter((s) => s !== sellerId) : [...prev, sellerId]
		);
	};

	const toggleCategory = (categoryName) => {
		setSelectedCategories((prev) =>
			prev.includes(categoryName) ? prev.filter((c) => c !== categoryName) : [...prev, categoryName]
		);
	};

	const clearFilters = () => {
		setPriceRange([0, 1000000]);
		setSelectedFormats([]);
		setSelectedLanguages([]);
		setSelectedSellers([]);
		setSelectedCategories([]);
		setSortBy("newest");
	};

	const handleAddToCart = (book, event) => {
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
					bookId: book.id || book._id,
					quantity: 1,
				},
			],
		});
	};

	const hasActiveFilters =
		priceRange[0] !== 0 ||
		priceRange[1] !== 1000000 ||
		selectedFormats.length > 0 ||
		selectedLanguages.length > 0 ||
		selectedSellers.length > 0 ||
		selectedCategories.length > 0;

	return (
		<div className="min-h-screen bg-background">
			<Header />

			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-12">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Breadcrumb */}
					<Breadcrumb className="mb-6">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink
									href="/"
									className="flex items-center gap-1 hover:text-primary transition-colors"
								>
									<Home className="w-4 h-4" />
									Trang chủ
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink href="#" className="flex items-center gap-1">
									<Grid3x3 className="w-4 h-4" />
									Danh mục
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage className="font-semibold">
									{categoryId === "all" ? "Tất cả sách" : currentCategory?.name || categoryName}
								</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					{/* Page Title */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
								<BookOpen className="w-10 h-10 text-primary" />
								{categoryId === "all" ? "Tất cả sách" : currentCategory?.name || categoryName}
							</h1>
							<p className="text-muted-foreground">
								Tìm thấy {filteredBooks.length} cuốn sách
							</p>
						</div>

						{/* Mobile Filter Toggle */}
						<Button
							variant="outline"
							size="sm"
							className="lg:hidden gap-2"
							onClick={() => setShowFilters(!showFilters)}
						>
							<SlidersHorizontal className="w-4 h-4" />
							Lọc
						</Button>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Left Sidebar - Filters */}
					<aside
						className={`lg:w-72 space-y-6 ${
							showFilters ? "block" : "hidden lg:block"
						}`}
					>
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg flex items-center gap-2">
										<Filter className="w-5 h-5" />
										Bộ lọc
									</CardTitle>
									{hasActiveFilters && (
										<Button
											variant="ghost"
											size="sm"
											onClick={clearFilters}
											className="h-8 text-xs"
										>
											<X className="w-3 h-3 mr-1" />
											Xóa
										</Button>
									)}
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Price Range Filter */}
								<div className="space-y-3">
									<Label className="text-sm font-semibold">Khoảng giá</Label>
									<Slider
										value={priceRange}
										onValueChange={setPriceRange}
										max={1000000}
										step={10000}
										className="w-full"
									/>
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<span>{priceRange[0].toLocaleString("vi-VN")}đ</span>
										<span>{priceRange[1].toLocaleString("vi-VN")}đ</span>
									</div>
								</div>

								<Separator />

								{/* Format Filter */}
								{availableFormats.length > 0 && (
									<>
										<div className="space-y-3">
											<Label className="text-sm font-semibold">Định dạng</Label>
											<div className="space-y-2">
												{availableFormats.map((format) => (
													<div key={format} className="flex items-center space-x-2">
														<Checkbox
															id={`format-${format}`}
															checked={selectedFormats.includes(format)}
															onCheckedChange={() => toggleFormat(format)}
														/>
														<label
															htmlFor={`format-${format}`}
															className="text-sm cursor-pointer flex-1"
														>
															{format === "PAPERBACK"
																? "Bìa mềm"
																: format === "HARDCOVER"
																? "Bìa cứng"
																: format}
														</label>
													</div>
												))}
											</div>
										</div>
										<Separator />
									</>
								)}

								{/* Language Filter */}
								{availableLanguages.length > 0 && (
									<>
										<div className="space-y-3">
											<Label className="text-sm font-semibold">Ngôn ngữ</Label>
											<div className="space-y-2">
												{availableLanguages.map((language) => (
													<div key={language} className="flex items-center space-x-2">
														<Checkbox
															id={`language-${language}`}
															checked={selectedLanguages.includes(language)}
															onCheckedChange={() => toggleLanguage(language)}
														/>
														<label
															htmlFor={`language-${language}`}
															className="text-sm cursor-pointer flex-1"
														>
															{language}
														</label>
													</div>
												))}
											</div>
										</div>
										<Separator />
									</>
								)}

								{/* Seller Filter */}
								{availableSellers.length > 0 && (
									<div className="space-y-3">
										<Label className="text-sm font-semibold">Người bán</Label>
										<div className="space-y-2 max-h-48 overflow-y-auto">
											{availableSellers.map((sellerId) => (
												<div key={sellerId} className="flex items-center space-x-2">
													<Checkbox
														id={`seller-${sellerId}`}
														checked={selectedSellers.includes(sellerId)}
														onCheckedChange={() => toggleSeller(sellerId)}
													/>
													<label
														htmlFor={`seller-${sellerId}`}
														className="text-sm cursor-pointer flex-1"
													>
														{getSellerStoreName(sellerId)}
													</label>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Category Filter - New Addition */}
								{availableCategories.length > 0 && (
									<div className="space-y-3">
										<Label className="text-sm font-semibold">Danh mục</Label>
										<div className="space-y-2 max-h-48 overflow-y-auto">
											{availableCategories.map((catName) => (
												<div key={catName} className="flex items-center space-x-2">
													<Checkbox
														id={`category-${catName}`}
														checked={selectedCategories.includes(catName)}
														onCheckedChange={() => toggleCategory(catName)}
													/>
													<label
														htmlFor={`category-${catName}`}
														className="text-sm cursor-pointer flex-1"
													>
														{catName}
													</label>
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Active Filters Display */}
						{hasActiveFilters && (
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">Đang áp dụng</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										{selectedFormats.map((format) => (
											<Badge
												key={format}
												variant="secondary"
												className="cursor-pointer"
												onClick={() => toggleFormat(format)}
											>
												{format}
												<X className="w-3 h-3 ml-1" />
											</Badge>
										))}
										{selectedLanguages.map((language) => (
											<Badge
												key={language}
												variant="secondary"
												className="cursor-pointer"
												onClick={() => toggleLanguage(language)}
											>
												{language}
												<X className="w-3 h-3 ml-1" />
											</Badge>
										))}
										{selectedCategories.map((catName) => (
											<Badge
												key={catName}
												variant="secondary"
												className="cursor-pointer"
												onClick={() => toggleCategory(catName)}
											>
												{catName}
												<X className="w-3 h-3 ml-1" />
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</aside>

					{/* Right Content - Books Grid */}
					<main className="flex-1 space-y-6">
						{/* Sort and View Options */}
						<div className="flex items-center justify-between">
							<p className="text-sm text-muted-foreground">
								Hiển thị{" "}
								<span className="font-semibold text-foreground">
									{filteredBooks.length}
								</span>{" "}
								kết quả
							</p>

							<div className="flex items-center gap-2">
								<Label className="text-sm">Sắp xếp:</Label>
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger className="w-[180px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="newest">Mới nhất</SelectItem>
										<SelectItem value="popular">Phổ biến</SelectItem>
										<SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
										<SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Books Grid */}
						{(booksLoading || (categoryId !== "all" && categoriesLoading)) ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{[...Array(8)].map((_, i) => (
									<Card key={i} className="overflow-hidden">
										<Skeleton className="h-64 w-full" />
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
						) : filteredBooks.length === 0 ? (
							<Card className="p-16 text-center">
								<BookOpen className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
								<h3 className="text-2xl font-bold mb-2">Không tìm thấy sách</h3>
								<p className="text-muted-foreground mb-4">
									Thử điều chỉnh bộ lọc để xem nhiều kết quả hơn
								</p>
								{hasActiveFilters && (
									<Button onClick={clearFilters} variant="outline">
										Xóa bộ lọc
									</Button>
								)}
							</Card>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{filteredBooks.map((book, index) => {
									const isOutOfStock = book.stock === 0 || book.stock === null;
									return (
										<motion.div
											key={book.id || book._id}
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
													<BookRating bookId={book.id || book._id} />
												</div>
												<CardHeader className="pb-3">
													<CardTitle className="line-clamp-2 text-base group-hover:text-primary transition-colors">
														{book.title}
													</CardTitle>
													<CardDescription className="line-clamp-1">
														{book.author}
													</CardDescription>
												</CardHeader>
												<CardFooter className="pt-0 flex items-center justify-between">
													<div>
														{book.price !== undefined && (
															<p className="text-xl font-bold text-primary">
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
														{isOutOfStock ? "Hết" : "Mua"}
													</Button>
												</CardFooter>
											</Card>
										</motion.div>
									);
								})}
							</div>
						)}
					</main>
				</div>
			</section>

			<Footer />
		</div>
	);
}
