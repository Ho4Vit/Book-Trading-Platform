package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.Entity.Payment;
import btp.bookingtradeplatform.Model.Request.CreatePaymentRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdatePaymentForm;
import btp.bookingtradeplatform.Service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Lấy tất cả thanh toán
    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<Payment>>> getAllPayments() {
        return paymentService.getAllPayments();
    }

    // Lấy thanh toán theo ID
    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseData<Payment>> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    // Tạo mới thanh toán
    @PostMapping("/create")
    public ResponseEntity<ResponseData<Payment>> createPayment(@RequestBody CreatePaymentRequest request) {
        return paymentService.createPayment(request);
    }

    // Cập nhật trạng thái thanh toán
    @PutMapping("/status/{id}")
    public ResponseEntity<ResponseData<Payment>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody UpdatePaymentForm request) {
        return paymentService.updatePaymentStatus(id, request);
    }
}
