package btp.bookingtradeplatform.Model.Request;


import btp.bookingtradeplatform.Model.Enum.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class PaymentStatusRequest {
    private PaymentStatus status;
}
