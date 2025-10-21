import React, { useState } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { categoryApi } from "@/api/index.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Package, Plus, Edit, Search, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageCategories() {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); // "asc" for A-Z, "desc" for Z-A
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: "",
    });

    // Fetch data
    const { data: categoriesResponse, isLoading, refetch } = useCustomQuery(
        ["categories"],
        categoryApi.getAllCategories
    );

    // Extract data from response
    const categories = categoriesResponse || [];

    const createMutation = useCustomMutation(categoryApi.createCategory, "POST", {
        invalidateKeys: ["categories"],
        onSuccess: () => {
            toast.success("Tạo danh mục thành công!");
            setIsCreateDialogOpen(false);
            resetForm();
        },
    });

    const updateMutation = useCustomMutation(
        (data) => categoryApi.updateCategory(selectedCategory.id, data),
        "PUT",
        {
            invalidateKeys: ["categories"],
            onSuccess: () => {
                toast.success("Cập nhật danh mục thành công!");
                setIsEditDialogOpen(false);
                setSelectedCategory(null);
            },
        }
    );

    // Filter and sort categories
    const filteredCategories = categories
        ?.filter((category) =>
            category.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOrder === "asc") {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });

    const resetForm = () => {
        setCategoryForm({
            name: "",
        });
    };

    const handleCreate = () => {
        createMutation.mutate({ name: categoryForm.name });
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setCategoryForm({
            name: category.name || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        updateMutation.mutate({ name: categoryForm.name });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý danh mục</h1>
                    <p className="text-muted-foreground">
                        Quản lý các danh mục sách trong hệ thống
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm danh mục
                </Button>
            </div>

            {/* Search and Sort */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm danh mục..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[180px]">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">A-Z</SelectItem>
                        <SelectItem value="desc">Z-A</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Cards Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </div>
            ) : filteredCategories && filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredCategories.map((category) => (
                        <Card
                            key={category.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary"
                            onClick={() => handleEdit(category)}
                        >

                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">
                                        {category.name}
                                    </CardTitle>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">
                        Không tìm thấy danh mục nào
                    </p>
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm danh mục mới</DialogTitle>
                        <DialogDescription>
                            Tạo danh mục sách mới trong hệ thống
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="categoryName">Tên danh mục *</Label>
                            <Input
                                id="categoryName"
                                value={categoryForm.name}
                                onChange={(e) =>
                                    setCategoryForm({
                                        ...categoryForm,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Nhập tên danh mục"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateDialogOpen(false);
                                resetForm();
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Đang tạo..." : "Tạo danh mục"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin danh mục #{selectedCategory?.id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-categoryName">Tên danh mục *</Label>
                            <Input
                                id="edit-categoryName"
                                value={categoryForm.name}
                                onChange={(e) =>
                                    setCategoryForm({
                                        ...categoryForm,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setSelectedCategory(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
