package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDTO {
    private Long bookId;
    private String ImgUrl;
    private String SellerName;
    private Long StoreId;
    private String StoreName;
    private String bookName;
    private int quantity;
    private BigDecimal price;

    public static CartItemDTO fromEntity(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setBookId(item.getBook().getId());
        dto.setImgUrl(item.getBook().getCoverImage());
        dto.setSellerName(item.getBook().getSeller().getFullName());
        dto.setBookName(item.getBook().getTitle());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getBook().getPrice());
        dto.setStoreName(item.getBook().getSeller().getStoreName());
        dto.setStoreId(item.getBook().getSeller().getId());
        return dto;
    }
}
