import React, { useState } from "react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { customerApi, sellerApi } from "@/api/index.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Store, Search, Edit, Eye, Mail, Phone, MapPin, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageUsers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userType, setUserType] = useState("customer");
    const [editForm, setEditForm] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        storeName: "",
        storeAddress: "",
        storeDescription: "",
    });

    // Fetch data
    const { data: customersResponse, isLoading: customersLoading, refetch: refetchCustomers } = useCustomQuery(
        ["admin-customers"],
        customerApi.getAllCustomers
    );

    const { data: sellersResponse, isLoading: sellersLoading, refetch: refetchSellers } = useCustomQuery(
        ["admin-sellers"],
        sellerApi.getAllSellers
    );

    // Extract data from response
    const customers = customersResponse || [];
    const sellers = sellersResponse || [];

    // Mutations
    const updateCustomerMutation = useCustomMutation(
        (data) => customerApi.updateCustomer(selectedUser.id, data),
        {
            onSuccess: () => {
                toast.success("Cập nhật khách hàng thành công!");
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                refetchCustomers();
            },
        }
    );

    const updateSellerMutation = useCustomMutation(
        (data) => sellerApi.updateSeller(selectedUser.id, data),
        {
            onSuccess: () => {
                toast.success("Cập nhật người bán thành công!");
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                refetchSellers();
            },
        }
    );

    // Filter users
    const filteredCustomers = customers?.filter(
        (customer) =>
            customer.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSellers = sellers?.filter(
        (seller) =>
            seller.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seller.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seller.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleView = (user, type) => {
        setSelectedUser(user);
        setUserType(type);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (user, type) => {
        setSelectedUser(user);
        setUserType(type);
        if (type === "customer") {
            setEditForm({
                username: user.username || "",
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                storeName: "",
                storeAddress: "",
                storeDescription: "",
            });
        } else {
            setEditForm({
                username: "",
                fullName: user.fullName || "",
                email: user.email || "",
                phone: "",
                address: "",
                storeName: user.storeName || "",
                storeAddress: user.storeAddress || "",
                storeDescription: user.storeDescription || "",
            });
        }
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (userType === "customer") {
            updateCustomerMutation.mutate({
                username: editForm.username,
                fullName: editForm.fullName,
                email: editForm.email,
                phone: editForm.phone,
                address: editForm.address,
            });
        } else {
            updateSellerMutation.mutate({
                fullName: editForm.fullName,
                email: editForm.email,
                storeName: editForm.storeName,
                storeAddress: editForm.storeAddress,
                storeDescription: editForm.storeDescription,
            });
        }
    };

    const getUserInitials = (name) => {
        return name?.substring(0, 2).toUpperCase() || "U";
    };

    const getDisplayName = (user, type) => {
        if (type === "customer") {
            return user.username || user.fullName || "N/A";
        }
        return user.fullName || user.storeName || "N/A";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                <p className="text-muted-foreground">
                    Quản lý khách hàng và người bán trong hệ thống
                </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="customers" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="customers" className="gap-2">
                        <Users className="h-4 w-4" />
                        Khách hàng ({customers?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="sellers" className="gap-2">
                        <Store className="h-4 w-4" />
                        Người bán ({sellers?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Customers Table */}
                <TabsContent value="customers" className="space-y-4">
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Người dùng</TableHead>
                                    <TableHead>Họ tên</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Số điện thoại</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customersLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={7}>
                                                <Skeleton className="h-12 w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredCustomers && filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <TableRow key={customer.id}>
                                            <TableCell className="font-medium">
                                                #{customer.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={customer.profileImage}
                                                            alt={customer.username}
                                                        />
                                                        <AvatarFallback>
                                                            {getUserInitials(customer.username || customer.fullName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{customer.username}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{customer.fullName || "N/A"}</TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>{customer.phone || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant="default">Hoạt động</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleView(customer, "customer")}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(customer, "customer")}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-muted-foreground">
                                                Không tìm thấy khách hàng nào
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* Sellers Table */}
                <TabsContent value="sellers" className="space-y-4">
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Tên cửa hàng</TableHead>
                                    <TableHead>Họ tên</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Địa chỉ</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sellersLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={7}>
                                                <Skeleton className="h-12 w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredSellers && filteredSellers.length > 0 ? (
                                    filteredSellers.map((seller) => (
                                        <TableRow key={seller.id}>
                                            <TableCell className="font-medium">
                                                #{seller.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={seller.profileImage}
                                                            alt={seller.storeName}
                                                        />
                                                        <AvatarFallback>
                                                            {getUserInitials(seller.storeName || seller.fullName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{seller.storeName || "N/A"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{seller.fullName || "N/A"}</TableCell>
                                            <TableCell>{seller.email}</TableCell>
                                            <TableCell>{seller.storeAddress || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant="default">Hoạt động</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleView(seller, "seller")}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(seller, "seller")}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <Store className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-muted-foreground">
                                                Không tìm thấy người bán nào
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Thông tin chi tiết</DialogTitle>
                        <DialogDescription>
                            Thông tin {userType === "customer" ? "khách hàng" : "người bán"}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage
                                        src={selectedUser.profileImage}
                                        alt={getDisplayName(selectedUser, userType)}
                                    />
                                    <AvatarFallback className="text-lg">
                                        {getUserInitials(getDisplayName(selectedUser, userType))}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        {getDisplayName(selectedUser, userType)}
                                    </h3>
                                    <Badge variant="default">
                                        {userType === "customer" ? "Khách hàng" : "Người bán"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {userType === "customer" ? (
                                    <>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Họ tên</p>
                                                <p className="font-medium">{selectedUser.fullName || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                                <p className="font-medium">{selectedUser.phone || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                                                <p className="font-medium">{selectedUser.address || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        {selectedUser.dateOfBirth && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Ngày sinh</p>
                                                    <p className="font-medium">
                                                        {new Date(selectedUser.dateOfBirth).toLocaleDateString("vi-VN")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedUser.gender && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Giới tính</p>
                                                    <p className="font-medium">
                                                        {selectedUser.gender === "MALE" ? "Nam" : selectedUser.gender === "FEMALE" ? "Nữ" : "Khác"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Store className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Tên cửa hàng</p>
                                                <p className="font-medium">{selectedUser.storeName || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Họ tên</p>
                                                <p className="font-medium">{selectedUser.fullName || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Địa chỉ cửa hàng</p>
                                                <p className="font-medium">{selectedUser.storeAddress || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        {selectedUser.storeDescription && (
                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                                <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-muted-foreground">Mô tả cửa hàng</p>
                                                    <p className="font-medium">{selectedUser.storeDescription}</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewDialogOpen(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin {userType === "customer" ? "khách hàng" : "người bán"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {userType === "customer" ? (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Tên người dùng</Label>
                                    <Input
                                        id="username"
                                        value={editForm.username}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, username: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">Họ tên</Label>
                                    <Input
                                        id="fullName"
                                        value={editForm.fullName}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, fullName: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, email: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        value={editForm.phone}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, phone: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <Input
                                        id="address"
                                        value={editForm.address}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, address: e.target.value })
                                        }
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="storeName">Tên cửa hàng</Label>
                                    <Input
                                        id="storeName"
                                        value={editForm.storeName}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, storeName: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">Họ tên</Label>
                                    <Input
                                        id="fullName"
                                        value={editForm.fullName}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, fullName: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, email: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="storeAddress">Địa chỉ cửa hàng</Label>
                                    <Input
                                        id="storeAddress"
                                        value={editForm.storeAddress}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, storeAddress: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="storeDescription">Mô tả cửa hàng</Label>
                                    <Input
                                        id="storeDescription"
                                        value={editForm.storeDescription}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, storeDescription: e.target.value })
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                setSelectedUser(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={
                                updateCustomerMutation.isPending ||
                                updateSellerMutation.isPending
                            }
                        >
                            {updateCustomerMutation.isPending ||
                            updateSellerMutation.isPending
                                ? "Đang cập nhật..."
                                : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
