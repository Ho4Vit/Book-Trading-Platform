package btp.bookingtradeplatform.Model.Response;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MomoPaymentResponse {
    private String partnerCode;
    private String orderId;
    private String requestId;
    private long amount;
    private String responseTime;
    private String message;
    private String resultCode;
    private String payUrl;
    private String deeplink;
    private String qrCodeUrl;
}
