package btp.bookingtradeplatform.Model.Request;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MomoPaymentRequest {
    private Long orderId;      // ID đơn hàng
    private double amount;     // Số tiền
    private String orderInfo;  // Thông tin mô tả đơn hàng
    private String returnUrl;  // URL người dùng được chuyển tới sau thanh toán
    private String notifyUrl;  // URL MoMo callback IPN (notify server)
}
