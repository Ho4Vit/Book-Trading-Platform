import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    BookOpen,
    Home,
    Users,
    LogOut,
    Menu,
    Settings,
    BarChart3,
    Shield,
    Package,
    ShoppingCart,
} from "lucide-react";

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, userId } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success("Đã đăng xuất thành công!");
        navigate("/");
    };

    const getUserInitials = () => {
        return "AD";
    };

    // Navigation items for admin
    const adminNavItems = [
        { path: "/admin", icon: BarChart3, label: "Tổng quan", exact: true },
        { path: "/admin/books", icon: BookOpen, label: "Quản lý sách" },
        { path: "/admin/users", icon: Users, label: "Người dùng" },
        { path: "/admin/orders", icon: ShoppingCart, label: "Đơn hàng" },
        { path: "/admin/settings", icon: Settings, label: "Cài đặt" },
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu */}
                            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72 p-0">
                                    <div className="flex flex-col h-full">
                                        {/* Mobile Logo */}
                                        <div className="p-6 border-b">
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-2"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Shield className="h-6 w-6 text-primary" />
                                                <span className="text-xl font-bold">Admin Panel</span>
                                            </Link>
                                        </div>

                                        {/* Mobile Navigation */}
                                        <nav className="flex-1 px-3 py-4 space-y-1">
                                            {adminNavItems.map((item) => {
                                                const Icon = item.icon;
                                                const active = isActive(item.path, item.exact);
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        onClick={() => setMobileMenuOpen(false)}
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

                                        {/* Mobile Footer */}
                                        <div className="p-4 border-t">
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    handleLogout();
                                                }}
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Đăng xuất
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Logo */}
                            <Link to="/admin" className="flex items-center gap-2">
                                <Shield className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold hidden sm:block">Admin Panel</span>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-1 ml-6">
                                {adminNavItems.slice(0, 4).map((item) => {
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
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center">
                            {/* Admin Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                                            <AvatarImage
                                                src={`https://api.dicebear.com/9.x/identicon/svg?seed=${userId}`}
                                                alt="Admin"
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
                                                Administrator
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                Quản trị viên
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={() => navigate("/admin")}
                                        className="gap-2 cursor-pointer"
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        Tổng quan
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => navigate("/admin/settings")}
                                        className="gap-2 cursor-pointer"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Cài đặt
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="gap-2 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/50 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="font-medium">BookNest Admin Panel</span>
                        </div>
                        <p>© 2025 BookNest. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
