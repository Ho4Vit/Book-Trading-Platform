package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.PaymentDTO;
import btp.bookingtradeplatform.Model.Entity.Book;
import btp.bookingtradeplatform.Model.Entity.CartItem;
import btp.bookingtradeplatform.Model.Entity.Order;
import btp.bookingtradeplatform.Model.Entity.Payment;
import btp.bookingtradeplatform.Model.Enum.OrderStatus;
import btp.bookingtradeplatform.Model.Enum.PaymentStatus;
import btp.bookingtradeplatform.Model.Request.CreatePaymentRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdatePaymentForm;
import btp.bookingtradeplatform.Repository.BookRepository;
import btp.bookingtradeplatform.Repository.OrderRepository;
import btp.bookingtradeplatform.Repository.PaymentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Transactional
@Service
public class PaymentService {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    public ResponseEntity<ResponseData<List<PaymentDTO>>> getAllPayments() {
        List<Payment> list = paymentRepository.findAll();
        List<PaymentDTO> dtoList = list.stream()
                .map(PaymentDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched all payments",
                dtoList
        ));
    }

    public ResponseEntity<ResponseData<PaymentDTO>> getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched payment successfully",
                PaymentDTO.fromEntity(payment)
        ));
    }

    @Transactional
    public ResponseEntity<ResponseData<PaymentDTO>> createPayment(CreatePaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BusinessException(AppException.ORDER_NOT_FOUND));

        Payment payment = new Payment();
        payment.setOrder(order);

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal totalAmount = order.getTotalPrice().subtract(discount);
        payment.setAmount(totalAmount);
        payment.setMethod(request.getMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Payment created successfully",
                PaymentDTO.fromEntity(savedPayment)
        ));
    }

    public ResponseEntity<ResponseData<PaymentDTO>> updatePaymentStatus(Long id, UpdatePaymentForm request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        payment.setStatus(request.getStatus());
        payment.setMethod(request.getMethod() != null ? request.getMethod() : payment.getMethod());
        Payment updated = paymentRepository.save(payment);

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Payment status updated successfully",
                PaymentDTO.fromEntity(updated)
        ));
    }

    public ResponseEntity<ResponseData<Void>> confirmPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        Order order = payment.getOrder();
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);
        order.setStatus(OrderStatus.CONFIRMED);
        orderService.decreaseStockForOrder(order);
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Payment confirmed successfully",
                null
        ));
    }
}
