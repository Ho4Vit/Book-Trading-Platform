import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Home } from "lucide-react";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get parameters from URL
    const orderId = searchParams.get("orderId");
    const resultCode = searchParams.get("resultCode");
    const message = searchParams.get("message");

    useEffect(() => {
        // Auto redirect after 5 seconds
        const timer = setTimeout(() => {
            navigate("/customer/orders");
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const isSuccess = resultCode === "0";

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <Card className="max-w-md w-full border-2">
                <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                        </div>

                        {/* Success Message */}
                        <div>
                            <h1 className="text-2xl font-bold text-green-600 mb-2">
                                {isSuccess ? "Thanh toán thành công!" : "Thanh toán không thành công"}
                            </h1>
                            <p className="text-muted-foreground">
                                {message || "Cảm ơn bạn đã đặt hàng"}
                            </p>
                        </div>

                        {/* Order Info */}
                        {orderId && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <Package className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-800">
                                        Mã đơn hàng: <strong>#{orderId}</strong>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p>✓ Đơn hàng của bạn đã được xác nhận</p>
                            <p>✓ Chúng tôi sẽ giao hàng trong 2-3 ngày</p>
                            <p>✓ Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi"</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1 gap-2"
                                onClick={() => navigate("/")}
                            >
                                <Home className="w-4 h-4" />
                                Về trang chủ
                            </Button>
                            <Button
                                className="flex-1 gap-2"
                                onClick={() => navigate("/customer/orders")}
                            >
                                <Package className="w-4 h-4" />
                                Xem đơn hàng
                            </Button>
                        </div>

                        {/* Auto redirect notice */}
                        <p className="text-xs text-muted-foreground">
                            Tự động chuyển đến trang đơn hàng sau 5 giây...
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

