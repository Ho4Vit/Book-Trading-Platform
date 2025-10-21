import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const { role } = useAuthStore();

    const getHomePath = () => {
        if (role === "ADMIN") return "/admin";
        if (role === "SELLER") return "/";
        if (role === "CUSTOMER") return "/";
        return "/";
    };

    return (
        <div className="h-screen flex flex-col justify-center items-center bg-background">
            <div className="text-center space-y-6 max-w-md px-4">
                <div className="space-y-2">
                    <h1 className="text-8xl font-bold text-primary">404</h1>
                    <h2 className="text-2xl font-semibold">Trang không tồn tại</h2>
                    <p className="text-muted-foreground">
                        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    <Button
                        onClick={() => navigate(getHomePath())}
                        className="gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </div>
    );
}
