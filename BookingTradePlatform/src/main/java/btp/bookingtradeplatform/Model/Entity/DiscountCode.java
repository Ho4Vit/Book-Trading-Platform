package btp.bookingtradeplatform.Model.Entity;

import btp.bookingtradeplatform.Model.Enum.ProviderType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DiscountCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code; // Mã giảm giá, ví dụ: "NEWCUSTOMER20"
    private BigDecimal discountAmount;
    private boolean percentage; // true = giảm theo %, false = giảm số tiền

    private BigDecimal minOrderValue;
    private LocalDateTime createdAt;
    private LocalDateTime expiryDate;
    private boolean active;

    private ProviderType provider;

    @ElementCollection
    @CollectionTable(name = "discount_provided_users", joinColumns = @JoinColumn(name = "discount_id"))
    @Column(name = "user_id")
    private List<Long> providedUserIds;
}
