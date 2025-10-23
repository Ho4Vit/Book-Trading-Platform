package btp.bookingtradeplatform.Model.Request;

import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MomoPaymentRequest {
    private Long orderId;      // ID đơn hàng
    private String orderInfo;  // Thông tin mô tả đơn hàng
    private BigDecimal discount;
    private String returnUrl;  // URL người dùng được chuyển tới sau thanh toán
    private String notifyUrl;  // URL MoMo callback IPN (notify server)
}
