package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Model.DTO.CartDTO;
import btp.bookingtradeplatform.Model.DeleteRequest.RemoveCartItemRequest;
import btp.bookingtradeplatform.Model.Entity.Book;
import btp.bookingtradeplatform.Model.Entity.Cart;
import btp.bookingtradeplatform.Model.Entity.CartItem;
import btp.bookingtradeplatform.Model.Entity.Customer;
import btp.bookingtradeplatform.Model.Request.CreateCartRequest;
import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Repository.BookRepository;
import btp.bookingtradeplatform.Repository.CartItemRepository;
import btp.bookingtradeplatform.Repository.CartRepository;
import btp.bookingtradeplatform.Repository.CustomerRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
@Transactional
@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BookRepository bookRepository;

    public ResponseEntity<ResponseData<Void>> addCartItem(CreateCartRequest request) {
        Customer customer = customerRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException(AppException.CUSTOMER_NOT_FOUND));

        Optional<Cart> optionalCart = cartRepository.findByUserId(customer.getId());
        Cart cart = optionalCart.orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserId(customer.getId());
            newCart.setCartItems(new ArrayList<>());
            newCart.setTotalPrice(BigDecimal.ZERO);
            return newCart;
        });

        for (CreateCartRequest.CartItemRequest itemRequest : request.getCartItems()) {
            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new BusinessException(AppException.BOOK_NOT_FOUND));

            boolean found = false;

            for (CartItem existingItem : cart.getCartItems()) {
                if (existingItem.getBook().getId().equals(itemRequest.getBookId())) {
                    int newQuantity = existingItem.getQuantity() + itemRequest.getQuantity();
                    if (newQuantity <= 0) {
                        cart.getCartItems().remove(existingItem);
                    } else {
                        existingItem.setQuantity(newQuantity);
                    }

                    found = true;
                    break;
                }
            }

            if (!found && itemRequest.getQuantity() > 0) {
                CartItem newItem = new CartItem();
                newItem.setBook(book);
                newItem.setQuantity(itemRequest.getQuantity());
                newItem.setCart(cart);
                cart.getCartItems().add(newItem);
            }
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CartItem item : cart.getCartItems()) {
            BigDecimal price = item.getBook().getPrice();
            totalPrice = totalPrice.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        cart.setTotalPrice(totalPrice);

        cartRepository.save(cart);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        null
                ));
    }


    public ResponseEntity<ResponseData<Void>> removeCartItem(RemoveCartItemRequest request) {
        Customer customer = customerRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException(AppException.CUSTOMER_NOT_FOUND));

        Cart cart = cartRepository.findByUserId(customer.getId())
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));

        boolean removed = cart.getCartItems().removeIf(item ->
                item.getBook().getId().equals(request.getBookId())
        );

        if (!removed) {
            throw new BusinessException(AppException.NOT_FOUND);
        }
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CartItem item : cart.getCartItems()) {
            BigDecimal pricePerBook = item.getBook().getPrice();
            totalPrice = totalPrice.add(pricePerBook.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        cart.setTotalPrice(totalPrice);
        cartRepository.save(cart);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        null
                ));
    }

    public ResponseEntity<ResponseData<CartDTO>> getCartByUserId(Long userId) {
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(AppException.CUSTOMER_NOT_FOUND));

        Cart cart = cartRepository.findByUserId(customer.getId())
                .orElse(null);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        new CartDTO().fromEntity(cart)
                ));
    }

}
