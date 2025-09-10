package btp.bookingtradeplatform.Model.Request;

import btp.bookingtradeplatform.Model.Enum.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {
    private Long orderId;
    private BigDecimal amount;
    private PaymentMethod method;
    private BigDecimal discount;
}
