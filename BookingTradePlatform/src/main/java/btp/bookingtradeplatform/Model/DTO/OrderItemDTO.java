package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.OrderItem;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {

    private Long id;

    private Long bookId;

    private String sellerName;

    private String bookTitle;

    private BigDecimal bookPrice;

    private int quantity;

    private Long sellerId;

    // Chuyển từ Entity → DTO
    public static OrderItemDTO fromEntity(OrderItem item) {
        if (item == null) return null;

        return OrderItemDTO.builder()
                .id(item.getId())
                .bookId(item.getBookId())
                .sellerName(item.getSellerName())
                .sellerId(item.getSellerId())
                .bookTitle(item.getBookTitle())
                .bookPrice(item.getBookPrice())
                .quantity(item.getQuantity())
                .build();
    }
}
