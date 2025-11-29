package btp.bookingtradeplatform.Model.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class SellerSalesReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sellerId;

    private int month;
    private int year;

    private BigDecimal totalRevenue;
    private int totalSold;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "report_id")
    private List<BookSalesRecord> bookSales;
}
