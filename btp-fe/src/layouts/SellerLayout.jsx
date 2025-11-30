import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { sellerApi } from "@/api/index.js";
import useCustomQuery from "@/hooks/useCustomQuery";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    BookOpen,
    Store,
    Package,
    LogOut,
    User,
    ShoppingCart,
    BarChart3,
    Menu,
    X,
    Ticket,
    MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";

export default function SellerLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, userId } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const { data: sellerData } = useCustomQuery(
        ["seller-profile", userId],
        () => sellerApi.getSellerById(userId),
        { enabled: !!userId }
    );

    const seller = sellerData?.data || sellerData;

    const handleLogout = () => {
        logout();
        toast.success("Đã đăng xuất thành công!");
        navigate("/");
    };

    const getUserInitials = () => {
        const name = seller?.name || "S";
        return name.substring(0, 2).toUpperCase();
    };

    const navItems = [
        { path: "/seller", icon: BarChart3, label: "Tổng quan", exact: true },
        { path: "/seller/books", icon: BookOpen, label: "Quản lý sách" },
        { path: "/seller/orders", icon: ShoppingCart, label: "Đơn hàng" },
        { path: "/seller/inventory", icon: Package, label: "Tồn kho" },
        { path: "/seller/vouchers", icon: Ticket, label: "Voucher" },
        { path: "/seller/feedbacks", icon: MessageSquare, label: "Đánh giá" },
        { path: "/seller/statistics", icon: BarChart3, label: "Thống kê" },
        { path: "/seller/profile", icon: User, label: "Hồ sơ" },
    ];

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden mr-2"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>

                    {/* Logo */}
                    <Link to="/seller" className="flex items-center gap-2">
                        <Store className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">BookNest Seller</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 ml-8">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path, item.exact);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        active
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-auto flex items-center gap-4">
                        <Separator orientation="vertical" className="h-6" />

                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                                        <AvatarImage
                                            src={
                                                seller?.profileImage ||
                                                `https://api.dicebear.com/9.x/identicon/svg?seed=${userId}`
                                            }
                                            alt={seller?.name}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-semibold">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {seller?.fullName || "Người bán"}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {seller?.email || ""}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => navigate("/seller")}
                                    className="gap-2 cursor-pointer"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Tổng quan
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => navigate("/seller/profile")}
                                    className="gap-2 cursor-pointer"
                                >
                                    <User className="w-4 h-4" />
                                    Hồ sơ cá nhân
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
                    <div className="fixed inset-y-0 left-0 w-72 bg-background border-r shadow-lg">
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b">
                                <Link
                                    to="/seller"
                                    className="flex items-center gap-2"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Store className="h-6 w-6 text-primary" />
                                    <span className="text-xl font-bold">BookNest Seller</span>
                                </Link>
                            </div>

                            <nav className="flex-1 px-3 py-4 space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path, item.exact);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                active
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        setSidebarOpen(false);
                                        handleLogout();
                                    }}
                                >
                                    <LogOut className="h-5 w-5" />
                                    Đăng xuất
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
