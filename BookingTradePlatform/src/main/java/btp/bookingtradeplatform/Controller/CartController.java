package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.CartDTO;
import btp.bookingtradeplatform.Model.Request.CreateCartRequest;
import btp.bookingtradeplatform.Model.DeleteRequest.RemoveCartItemRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Service.CartService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<ResponseData<Void>> addCartItem(@RequestBody CreateCartRequest request) {
        return cartService.addCartItem(request);
    }

    @PostMapping("/remove")
    public ResponseEntity<ResponseData<Void>> removeCartItem(@RequestBody RemoveCartItemRequest request) {
        return cartService.removeCartItem(request);
    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<ResponseData<CartDTO>> getCartByUserId(@PathVariable Long userId) {
        return cartService.getCartByUserId(userId);
    }
}
