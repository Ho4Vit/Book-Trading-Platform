package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.OrderDTO;
import btp.bookingtradeplatform.Model.DTO.PaymentDTO;
import btp.bookingtradeplatform.Model.Entity.*;
import btp.bookingtradeplatform.Model.Enum.OrderStatus;
import btp.bookingtradeplatform.Model.Request.CreateOrderRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdateOrderStatus;
import btp.bookingtradeplatform.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
@Transactional
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

    @Autowired
    private DiscountCodeRepository discountCodeRepository;

    public ResponseEntity<ResponseData<List<OrderDTO>>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        List<OrderDTO> dto = orders.stream()
                .map(OrderDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched all orders successfully",
                dto
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

        Order order = Order.builder()
                .customer(customer)
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalOrder = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {

            Book book = bookRepository.findById(itemReq.getBookId())
                    .orElseThrow(() -> new BusinessException(AppException.BOOK_NOT_FOUND));

            BigDecimal bookPrice = book.getPrice();
            int quantity = itemReq.getQuantity();
            BigDecimal subtotal = bookPrice.multiply(BigDecimal.valueOf(quantity));

            BigDecimal discountAmount = BigDecimal.ZERO;
            BigDecimal totalAfterDiscount = subtotal;

            DiscountCode discountCode = null;
            if (itemReq.getDiscountCode() != null && !itemReq.getDiscountCode().isBlank()) {
                discountCode = discountCodeRepository.findByCode(itemReq.getDiscountCode());

                if (discountCode != null) {
                    if (discountCode.isPercentage()) {
                        // Giảm theo %
                        discountAmount = subtotal.multiply(discountCode.getDiscountAmount())
                                .divide(BigDecimal.valueOf(100));
                    } else {
                        // Giảm theo số tiền cố định
                        discountAmount = discountCode.getDiscountAmount();
                    }

                    totalAfterDiscount = subtotal.subtract(discountAmount);
                    if (totalAfterDiscount.compareTo(BigDecimal.ZERO) < 0) {
                        totalAfterDiscount = BigDecimal.ZERO;
                    }
                }
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .bookId(book.getId())
                    .sellerId(book.getSeller().getId())
                    .sellerName(book.getSeller().getStoreName())
                    .bookTitle(book.getTitle())
                    .bookPrice(bookPrice)
                    .quantity(quantity)
                    .discountCode(itemReq.getDiscountCode())
                    .discountAmount(discountAmount)
                    .totalAmount(totalAfterDiscount)
                    .build();

            orderItems.add(orderItem);

            totalOrder = totalOrder.add(totalAfterDiscount);
        }

        order.setOrderItems(orderItems);
        order.setTotalPrice(totalOrder);

        Order saved = orderRepository.save(order);

        return ResponseEntity.ok(
                new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        "Order created successfully",
                        OrderDTO.fromEntity(saved)
                )
        );
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

    public void reverseStockForOrder(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            // Lấy lại Book dựa trên snapshot bookId
            Book book = bookRepository.findById(item.getBookId())
                    .orElseThrow(() -> new BusinessException(AppException.BOOK_NOT_FOUND));
            int quantity = item.getQuantity();
            // Tăng lại kho
            book.setStock(book.getStock() + quantity);
            // Giảm số lượng đã bán
            book.setSoldCount(book.getSoldCount() - quantity);
            bookRepository.save(book);
        }
    }


    public void decreaseStockForOrder(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            // Lấy Book theo bookId snapshot
            Book book = bookRepository.findById(item.getBookId())
                    .orElseThrow(() -> new BusinessException(AppException.BOOK_NOT_FOUND));
            int quantity = item.getQuantity();
            // Kiểm tra đủ hàng
            if (book.getStock() < quantity) {
                throw new BusinessException(AppException.OUT_OF_STOCK);
            }
            // Trừ kho
            book.setStock(book.getStock() - quantity);
            // Tăng số lượng đã bán
            book.setSoldCount(book.getSoldCount() + quantity);
            bookRepository.save(book);
        }
    }


    public ResponseEntity<ResponseData<Void>> CancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        if (order.getStatus() == OrderStatus.CONFIRMED) {
            throw new BusinessException(AppException.CANNOT_CANCEL_ORDER);
        }
        order.setStatus( OrderStatus.CANCELLED);
        orderRepository.save(order);
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Order cancelled successfully",
                null
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

    public ResponseEntity<ResponseData<List<OrderDTO>>> getOrdersBySellerId(Long sellerId) {
        List<Order> orders = orderRepository.findOrdersBySellerIdAndStatus(sellerId);

//        if (orders.isEmpty()) {
//            throw new BusinessException(AppException.NOT_FOUND);
//        }
        List<OrderDTO> dtos = orders.stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched pending orders by seller successfully",
                dtos
        ));
    }


}
