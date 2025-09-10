package btp.bookingtradeplatform.Model.UpdateRequest;

import btp.bookingtradeplatform.Model.Entity.Order;
import btp.bookingtradeplatform.Model.Enum.PaymentMethod;
import btp.bookingtradeplatform.Model.Enum.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePaymentForm {
    private PaymentMethod method;
    private PaymentStatus status;
    private LocalDateTime paymentDate;
    private BigDecimal discount ;
}
