package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.Entity.Payment;
import btp.bookingtradeplatform.Model.Enum.PaymentStatus;
import btp.bookingtradeplatform.Model.Request.CreatePaymentRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdatePaymentForm;
import btp.bookingtradeplatform.Repository.OrderRepository;
import btp.bookingtradeplatform.Repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    public ResponseEntity<ResponseData<List<Payment>>> getAllPayments() {
        List<Payment> list = paymentRepository.findAll();
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched all payments",
                list
        ));
    }

    public ResponseEntity<ResponseData<Payment>> getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Fetched payment successfully",
                payment
        ));
    }

    public ResponseEntity<ResponseData<Payment>> createPayment(CreatePaymentRequest request) {
        Payment payment = new Payment();
        payment.setOrder(orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BusinessException(AppException.ORDER_NOT_FOUND)));
        BigDecimal totalAmount = (payment.getOrder().getTotalPrice()).subtract(
                request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO
        );
        payment.setAmount(totalAmount);
        payment.setMethod(request.getMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);

        Payment saved = paymentRepository.save(payment);

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Payment created successfully",
                saved
        ));
    }

    public ResponseEntity<ResponseData<Payment>> updatePaymentStatus(Long id, UpdatePaymentForm request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        payment.setStatus(request.getStatus());
        payment.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        payment.setMethod(request.getMethod() != null ? request.getMethod() : payment.getMethod());

        Payment updated = paymentRepository.save(payment);

        return ResponseEntity.ok(new ResponseData<>(
                AppException.SUCCESS.getCode(),
                "Payment status updated successfully",
                updated
        ));
    }

}
