package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.Order;
import btp.bookingtradeplatform.Model.Entity.CartItem;
import btp.bookingtradeplatform.Model.Enum.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private Long customerId;
    private List<CartItemDTO> cartItems;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private LocalDateTime orderDate;

    public static OrderDTO fromEntity(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .cartItems(order.getOrderItems().stream()
                        .map(CartItemDTO::fromEntity)
                        .collect(Collectors.toList()))
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .orderDate(order.getOrderDate())
                .build();
    }
}
