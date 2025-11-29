package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.BookSalesRecord;
import btp.bookingtradeplatform.Model.Entity.SellerSalesReport;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerSalesReportDTO implements Serializable {

    private Long sellerId;
    private int month;
    private int year;
    private BigDecimal totalRevenue;
    private int totalSold;
    private List<BookSalesRecordDTO> bookSales;

    // Nested DTO
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookSalesRecordDTO implements Serializable {
        private Long bookId;
        private String bookTitle;
        private int quantity;
    }

    // Mapper từ Entity sang DTO
    public static SellerSalesReportDTO fromEntity(SellerSalesReport report) {
        if (report == null) return null;

        List<BookSalesRecordDTO> bookSalesDTO = report.getBookSales().stream()
                .map(bookRecord -> BookSalesRecordDTO.builder()
                        .bookId(bookRecord.getBook().getId())
                        .bookTitle(bookRecord.getBook().getTitle())
                        .quantity(bookRecord.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return SellerSalesReportDTO.builder()
                .sellerId(report.getSellerId())
                .month(report.getMonth())
                .year(report.getYear())
                .totalRevenue(report.getTotalRevenue())
                .totalSold(report.getTotalSold())
                .bookSales(bookSalesDTO)
                .build();
    }
}
