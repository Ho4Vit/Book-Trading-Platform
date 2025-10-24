package btp.bookingtradeplatform.Model.Request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DiscountRequest {
    private Long userId;
    private Long bookId;
    private BigDecimal orderValue;
}
