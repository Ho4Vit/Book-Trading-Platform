package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.OrderDTO;
import btp.bookingtradeplatform.Model.Entity.*;
import btp.bookingtradeplatform.Model.Enum.OrderStatus;
import btp.bookingtradeplatform.Model.Request.CreateOrderRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateOrderStatus;
import btp.bookingtradeplatform.Repository.BookRepository;
import btp.bookingtradeplatform.Repository.CartItemRepository;
import btp.bookingtradeplatform.Repository.CustomerRepository;
import btp.bookingtradeplatform.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private BookRepository bookRepository;

    public ResponseEntity<ResponseData<List<Order>>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched all orders successfully",
                orders
        ));
    }

    public ResponseEntity<ResponseData<OrderDTO>> getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched order successfully",
                OrderDTO.fromEntity(order)
        ));
    }

    public ResponseEntity<ResponseData<OrderDTO>> createOrder(CreateOrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new BusinessException(AppException.USER_NOT_FOUND));

        List<CartItem> cartItems = request.getItems().stream().map(itemRequest -> {
            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new BusinessException(AppException.BOOK_NOT_FOUND));

            CartItem item = new CartItem();
            item.setBook(book);
            item.setQuantity(itemRequest.getQuantity());
            cartItemRepository.save(item);
            return item;
        }).toList();

        BigDecimal total = cartItems.stream()
                .map(item -> item.getBook().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderItems(cartItems);
        order.setTotalPrice(total);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        Order saved = orderRepository.save(order);

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Order created successfully",
                OrderDTO.fromEntity(saved)
        ));
    }

    public ResponseEntity<ResponseData<OrderDTO>> updateOrderStatus(Long id, UpdateOrderStatus request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        order.setStatus(request.getStatus());
        Order updated = orderRepository.save(order);

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Order status updated successfully",
                OrderDTO.fromEntity(updated)
        ));
    }

    public ResponseEntity<ResponseData<List<OrderDTO>>> getOrdersByCustomerId(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);

        if (orders.isEmpty()) {
            throw new BusinessException(AppException.NOT_FOUND);
        }

        List<OrderDTO> dtos = orders.stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched orders for customer successfully",
                dtos
        ));
    }

}
