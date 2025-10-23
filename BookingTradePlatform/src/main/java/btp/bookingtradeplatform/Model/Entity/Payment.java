package btp.bookingtradeplatform.Model.Entity;

import btp.bookingtradeplatform.Model.Enum.PaymentMethod;
import btp.bookingtradeplatform.Model.Enum.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal amount;



    @Enumerated(EnumType.STRING)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private LocalDateTime paymentDate;

    private boolean isAccepted = false;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    private BigDecimal discount = BigDecimal.ZERO;

}