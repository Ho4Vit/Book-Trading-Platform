package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.Cart;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTO {
    private Long id;
    private Long userId;
    private List<CartItemDTO> cartItems;
    private BigDecimal totalPrice;

    public static CartDTO fromEntity(Cart cart) {
        return CartDTO.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .totalPrice(cart.getTotalPrice())
                .cartItems(
                        cart.getCartItems().stream()
                                .map(CartItemDTO::fromEntity)
                                .collect(Collectors.toList())
                )
                .build();
    }
}
