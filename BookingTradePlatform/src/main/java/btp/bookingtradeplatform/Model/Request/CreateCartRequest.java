package btp.bookingtradeplatform.Model.Request;

import lombok.Data;

import java.util.List;

@Data
public class CreateCartRequest {
    private Long userId;
    private List<CartItemRequest> cartItems;

    @Data
    public static class CartItemRequest {
        private Long bookId;
        private int quantity;
    }
}