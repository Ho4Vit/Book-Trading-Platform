package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDTO {
    private BookDTO book;
    private int quantity;

    public static CartItemDTO fromEntity(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setBook(BookDTO.fromEntity(item.getBook()));
        dto.setQuantity(item.getQuantity());
        return dto;
    }
}
