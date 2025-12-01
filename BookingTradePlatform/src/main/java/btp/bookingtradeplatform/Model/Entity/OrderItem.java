package btp.bookingtradeplatform.Model.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với Order
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private Long bookId;

    private String coverImage;

    private Long sellerId;
    // Snapshot dữ liệu book tại thời điểm đặt hàng
    private String sellerName;

    private String bookTitle;

    private BigDecimal bookPrice;

    private int quantity;

    private String discountCode;

    private BigDecimal discountAmount;

    private BigDecimal totalAmount;
}
