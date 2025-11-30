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
import btp.bookingtradeplatform.Repository.BookRepository;
import btp.bookingtradeplatform.Repository.CartItemRepository;
import btp.bookingtradeplatform.Repository.CustomerRepository;
import btp.bookingtradeplatform.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        List<OrderItem> orderItems = request.getItems().stream().map(itemRequest -> {
            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new BusinessException(AppException.BOOK_NOT_FOUND));

            OrderItem orderItem = new OrderItem();
            orderItem.setBookId(book.getId());
            orderItem.setBookPrice(book.getPrice());
            orderItem.setSellerName(book.getSeller().getStoreName());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setSellerId(book.getSeller().getId());
            orderItem.setBookTitle(book.getTitle());
            orderItem.setOrder(order);
            return orderItem;
        }).toList();

        order.setOrderItems(orderItems);

        BigDecimal total = orderItems.stream()
                .map(oi -> oi.getBookPrice().multiply(BigDecimal.valueOf(oi.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalPrice(total);

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
