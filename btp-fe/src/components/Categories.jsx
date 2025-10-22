import React from "react";
import { useNavigate } from "react-router-dom";
import { categoryApi } from "@/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Grid3x3 } from "lucide-react";

const Categories = () => {
	const navigate = useNavigate();

	const { data: categoriesData, isLoading } = useCustomQuery(
		["categories"],
		() => categoryApi.getAllCategories(),
		{ staleTime: 1000 * 60 * 10 }
	);

	const categories = Array.isArray(categoriesData?.data)
		? categoriesData.data
		: Array.isArray(categoriesData)
		? categoriesData
		: [];

	const handleCategoryClick = (category) => {
		navigate(`/category/${category.id}`, { state: { categoryName: category.name } });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="gap-2 font-medium">
					<Grid3x3 className="w-4 h-4" />
					Danh mục
					<ChevronDown className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-64 max-h-96 overflow-y-auto" align="start">
				<DropdownMenuLabel className="flex items-center gap-2">
					<Grid3x3 className="w-4 h-4" />
					Danh mục sách
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{isLoading ? (
					<div className="p-2 space-y-2">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="h-8 w-full" />
						))}
					</div>
				) : categories.length === 0 ? (
					<div className="p-4 text-center text-sm text-muted-foreground">
						Không có danh mục nào
					</div>
				) : (
					<>
						<DropdownMenuItem
							onClick={() => navigate("/category/all")}
							className="cursor-pointer font-medium"
						>
							<Badge variant="outline" className="mr-2">
								Tất cả
							</Badge>
							Xem tất cả sách
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{categories.map((category) => (
							<DropdownMenuItem
								key={category.id}
								onClick={() => handleCategoryClick(category)}
								className="cursor-pointer"
							>
								<span className="flex-1">{category.name}</span>
								{category.bookCount !== undefined && (
									<Badge variant="secondary" className="ml-2">
										{category.bookCount}
									</Badge>
								)}
							</DropdownMenuItem>
						))}
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default Categories;
