import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Home, XCircle, Loader2 } from "lucide-react";
import { paymentApi } from "@/api";
import useCustomMutation from "@/hooks/useCustomMutation";
import toast from "react-hot-toast";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isConfirming, setIsConfirming] = useState(true);

    // Get parameters from URL
    const orderId = searchParams.get("orderId");
    const paymentId = searchParams.get("paymentId");
    const resultCode = searchParams.get("resultCode");
    const message = searchParams.get("message");

    // Confirm payment mutation
    const confirmPaymentMutation = useCustomMutation(
        (paymentId) => paymentApi.confirmPayment(paymentId),
        null,
        {
            onSuccess: (response) => {
                setIsConfirming(false);
                toast.success("Thanh toán thành công!");
            },
            onError: (error) => {
                setIsConfirming(false);
                toast.error(error?.message || "Không thể xác nhận thanh toán");
            },
        }
    );

    useEffect(() => {
        // Call confirmPayment when component mounts if paymentId exists
        if (paymentId && resultCode === "0") {
            confirmPaymentMutation.mutate(paymentId);
        } else {
            setIsConfirming(false);
        }
    }, [paymentId, resultCode]);

    useEffect(() => {
        // Auto redirect after 5 seconds when not confirming
        if (!isConfirming) {
            const timer = setTimeout(() => {
                navigate("/customer/orders");
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [navigate, isConfirming]);

    const isSuccess = resultCode === "0";

    // Show loading state while confirming payment
    if (isConfirming) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
                <Card className="max-w-md w-full border-2">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-blue-600 mb-2">
                                    Đang xác nhận thanh toán...
                                </h1>
                                <p className="text-muted-foreground">
                                    Vui lòng chờ trong giây lát
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <Card className="max-w-md w-full border-2">
                <CardContent className="pt-6">
                    <div className="text-center space-y-6">
                        {/* Success/Error Icon */}
                        <div className="flex justify-center">
                            <div className={`w-20 h-20 rounded-full ${isSuccess ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                                {isSuccess ? (
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                ) : (
                                    <XCircle className="w-12 h-12 text-red-600" />
                                )}
                            </div>
                        </div>

                        {/* Success/Error Message */}
                        <div>
                            <h1 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                                {isSuccess ? "Thanh toán thành công!" : "Thanh toán không thành công"}
                            </h1>
                            <p className="text-muted-foreground">
                                {isSuccess
                                    ? "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và thanh toán thành công."
                                    : message || "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."}
                            </p>
                        </div>

                        {/* Order Info */}
                        {orderId && (
                            <div className={`border rounded-lg p-4 ${isSuccess ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <Package className={`w-4 h-4 ${isSuccess ? 'text-blue-600' : 'text-orange-600'}`} />
                                    <span className={isSuccess ? 'text-blue-800' : 'text-orange-800'}>
                                        Mã đơn hàng: <strong>#{orderId}</strong>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Additional Info - only show on success */}
                        {isSuccess && (
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>✓ Đơn hàng của bạn đã được xác nhận</p>
                                <p>✓ Thanh toán đã hoàn tất</p>
                                <p>✓ Chúng tôi sẽ giao hàng trong 2-3 ngày</p>
                                <p>✓ Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi"</p>
                            </div>
                        )}

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

