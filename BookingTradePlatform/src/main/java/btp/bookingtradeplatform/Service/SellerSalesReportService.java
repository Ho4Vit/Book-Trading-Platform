package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Model.DTO.SellerSalesReportDTO;
import btp.bookingtradeplatform.Model.Entity.*;
import btp.bookingtradeplatform.Repository.OrderRepository;
import btp.bookingtradeplatform.Repository.SellerSalesReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerSalesReportService {

    private final OrderRepository orderRepository;
    private final SellerSalesReportRepository reportRepository;

    public SellerSalesReportDTO generateMonthlyReport(Long sellerId, int month, int year) {
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.isPaid()
                        && o.getOrderDate().getMonthValue() == month
                        && o.getOrderDate().getYear() == year
                        && o.getOrderItems().stream().anyMatch(
                        item -> item.getBook().getSeller().getId().equals(sellerId)
                ))
                .toList();

        if (orders.isEmpty()) {
            return SellerSalesReportDTO.builder()
                    .sellerId(sellerId)
                    .month(month)
                    .year(year)
                    .totalRevenue(BigDecimal.ZERO)
                    .totalSold(0)
                    .bookSales(List.of())
                    .build();
        }

        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalSold = 0;
        Map<Book, Integer> bookMap = new HashMap<>();

        for (Order order : orders) {
            totalRevenue = totalRevenue.add(order.getTotalPrice());
            for (CartItem item : order.getOrderItems()) {
                if (!item.getBook().getSeller().getId().equals(sellerId)) continue;

                totalSold += item.getQuantity();
                bookMap.merge(item.getBook(), item.getQuantity(), Integer::sum);
            }
        }

        List<BookSalesRecord> bookSales = bookMap.entrySet().stream()
                .map(e -> BookSalesRecord.builder()
                        .book(e.getKey())
                        .quantity(e.getValue())
                        .build())
                .toList();

        SellerSalesReport report = SellerSalesReport.builder()
                .sellerId(sellerId)
                .month(month)
                .year(year)
                .totalRevenue(totalRevenue)
                .totalSold(totalSold)
                .bookSales(bookSales)
                .build();

        reportRepository.save(report);

        // Convert sang DTO
        return SellerSalesReportDTO.fromEntity(report);
    }

    public List<SellerSalesReportDTO> getAllReportsDTO() {
        return reportRepository.findAll().stream()
                .map(SellerSalesReportDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<SellerSalesReportDTO> getReportsBySellerDTO(Long sellerId) {
        return reportRepository.findBySellerId(sellerId).stream()
                .map(SellerSalesReportDTO::fromEntity)
                .collect(Collectors.toList());
    }

    
}
