import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { sellerApi, customerApi } from "@/api/index.js";
import CartPopover from "@/components/CartPopover";
import useCustomQuery from "@/hooks/useCustomQuery";
import toast from "react-hot-toast";
import LoginModal from "@/components/LoginModal";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    BookOpen,
    Home,
    User,
    LogOut,
    Store,
    Package,
    ChevronDown,
    Sparkles,
    Menu,
    Bell,
    Search,
    ShoppingBag,
    Heart,
    Settings,
} from "lucide-react";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, logout, userId } = useAuthStore();
    const [showLogin, setShowLogin] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: userProfile } = useCustomQuery(
        ["user-profile", role, userId],
        role === "CUSTOMER"
            ? () => customerApi.getCustomerById(userId)
            : role === "SELLER"
            ? () => sellerApi.getSellerById(userId)
            : null,
        { enabled: !!userId && !!role }
    );

    const handleLogout = () => {
        logout();
        toast.success("Đã đăng xuất thành công!");
        navigate("/");
    };

    const getUserInitials = () => {
        const username = userProfile?.username || "U";
        return username.substring(0, 2).toUpperCase();
    };

    // Navigation items for customer
    const customerNavItems = [
        { path: "/", icon: Home, label: "Trang chủ", exact: true },
        { path: "/customer/profile", icon: User, label: "Hồ sơ" },
        { path: "/customer/orders", icon: ShoppingBag, label: "Đơn hàng" },
        { path: "/customer/wishlist", icon: Heart, label: "Yêu thích" },
        { path: "/customer/settings", icon: Settings, label: "Cài đặt" },
    ];

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Login Modal */}
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu - Only show for logged in customers */}
                            {userId && role === "CUSTOMER" && (
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
                                                    to="/"
                                                    className="flex items-center gap-2"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <BookOpen className="h-6 w-6 text-primary" />
                                                    <span className="text-xl font-bold">BookNest</span>
                                                </Link>
                                            </div>

                                            {/* Mobile Navigation */}
                                            <nav className="flex-1 px-3 py-4 space-y-1">
                                                {customerNavItems.map((item) => {
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
                            )}

                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold hidden sm:block">BookNest</span>
                            </Link>

                            {/* Desktop Navigation for Customer */}
                            {userId && role === "CUSTOMER" && (
                                <nav className="hidden md:flex items-center gap-1 ml-6">
                                    {customerNavItems.slice(0, 4).map((item) => {
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
                            )}

                            {/* Desktop Navigation for non-customers */}
                            {!userId || role !== "CUSTOMER" ? (
                                <nav className="hidden md:flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate("/")}
                                        className="gap-2"
                                    >
                                        <Home className="w-4 h-4" />
                                        Trang chủ
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate("/books")}
                                        className="gap-2"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Sách
                                    </Button>

                                    {role === "SELLER" && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => navigate("/seller")}
                                            className="gap-2"
                                        >
                                            <Store className="w-4 h-4" />
                                            Quản lý bán hàng
                                        </Button>
                                    )}
                                </nav>
                            ) : null}
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-2">
                            {/* Search Button - Only for logged in users */}
                            {userId && (
                                <Button variant="ghost" size="icon" className="hidden sm:flex">
                                    <Search className="h-5 w-5" />
                                </Button>
                            )}

                            {/* Notifications - Only for logged in users */}
                            {userId && (
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                        3
                                    </Badge>
                                </Button>
                            )}

                            {/* Cart */}
                            <CartPopover />

                            {userId && <Separator orientation="vertical" className="h-6" />}

                            {/* Auth Section */}
                            {!userId ? (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowLogin(true)}
                                        className="hidden sm:flex"
                                    >
                                        Đăng nhập
                                    </Button>
                                    <Button
                                        onClick={() => navigate("/register-customer")}
                                        className="gap-2 bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:opacity-90"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Đăng ký
                                    </Button>
                                </div>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                                                <AvatarImage
                                                    src={
                                                        userProfile?.profileImage ||
                                                        `https://api.dicebear.com/9.x/identicon/svg?seed=${userId}`
                                                    }
                                                    alt={userProfile?.username}
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
                                                    {userProfile?.username || "Người dùng"}
                                                </p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {role === "CUSTOMER"
                                                        ? "Khách hàng"
                                                        : role === "SELLER"
                                                        ? "Người bán"
                                                        : role}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        {role === "CUSTOMER" && (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() => navigate("/")}
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <Home className="w-4 h-4" />
                                                    Trang chủ
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => navigate("/customer/profile")}
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Thông tin cá nhân
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => navigate("/customer/orders")}
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <Package className="w-4 h-4" />
                                                    Đơn hàng của tôi
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => navigate("/customer/settings")}
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Cài đặt
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {role === "SELLER" && (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() => navigate("/seller")}
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <Store className="w-4 h-4" />
                                                    Trang quản lý
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => navigate("/seller/books")}
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                    Quản lý sách
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => navigate("/seller/orders")}
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <Package className="w-4 h-4" />
                                                    Đơn hàng
                                                </DropdownMenuItem>
                                            </>
                                        )}

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
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;

