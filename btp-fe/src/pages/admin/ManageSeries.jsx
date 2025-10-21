import React, { useState } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { seriesApi } from "@/api/index.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Plus, Edit, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageSeries() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedSeries, setSelectedSeries] = useState(null);
    const [seriesForm, setSeriesForm] = useState({
        seriesName: "",
        description: "",
    });

    // Fetch data
    const { data: seriesResponse, isLoading, refetch } = useCustomQuery(
        ["series"],
        seriesApi.getAllSeries
    );

    // Extract data from response
    const series = seriesResponse || [];

    // Mutations
    const createMutation = useCustomMutation(seriesApi.createSeries, {
        onSuccess: () => {
            toast.success("Tạo series thành công!");
            setIsCreateDialogOpen(false);
            resetForm();
            refetch();
        },
    });

    const updateMutation = useCustomMutation(
        (data) => seriesApi.updateSeries(selectedSeries.seriesId, data),
        {
            onSuccess: () => {
                toast.success("Cập nhật series thành công!");
                setIsEditDialogOpen(false);
                setSelectedSeries(null);
                refetch();
            },
        }
    );

    // Filter series
    const filteredSeries = series?.filter((s) =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setSeriesForm({
            seriesName: "",
            description: "",
        });
    };

    const handleCreate = () => {
        createMutation.mutate(seriesForm);
    };

    const handleEdit = (s) => {
        setSelectedSeries(s);
        setSeriesForm({
            seriesName: s.name || "",
            description: s.description || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        updateMutation.mutate(seriesForm);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý Series</h1>
                    <p className="text-muted-foreground">
                        Quản lý các series sách trong hệ thống
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm series
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm series..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tên series</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4}>
                                        <Skeleton className="h-12 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredSeries && filteredSeries.length > 0 ? (
                            filteredSeries.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-medium">
                                        #{s.id}
                                    </TableCell>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell>{s.description || "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(s)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-muted-foreground">
                                        Không tìm thấy series nào
                                    </p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm series mới</DialogTitle>
                        <DialogDescription>
                            Tạo series sách mới trong hệ thống
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="seriesName">Tên series *</Label>
                            <Input
                                id="seriesName"
                                value={seriesForm.seriesName}
                                onChange={(e) =>
                                    setSeriesForm({
                                        ...seriesForm,
                                        seriesName: e.target.value,
                                    })
                                }
                                placeholder="Nhập tên series"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={seriesForm.description}
                                onChange={(e) =>
                                    setSeriesForm({
                                        ...seriesForm,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Nhập mô tả series"
                                rows={4}
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
                            {createMutation.isPending ? "Đang tạo..." : "Tạo series"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa series</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin series #{selectedSeries?.id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-seriesName">Tên series *</Label>
                            <Input
                                id="edit-seriesName"
                                value={seriesForm.seriesName}
                                onChange={(e) =>
                                    setSeriesForm({
                                        ...seriesForm,
                                        seriesName: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Mô tả</Label>
                            <Textarea
                                id="edit-description"
                                value={seriesForm.description}
                                onChange={(e) =>
                                    setSeriesForm({
                                        ...seriesForm,
                                        description: e.target.value,
                                    })
                                }
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setSelectedSeries(null);
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
