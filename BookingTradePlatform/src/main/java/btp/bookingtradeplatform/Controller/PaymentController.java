package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.PaymentDTO;
import btp.bookingtradeplatform.Model.Request.CreatePaymentRequest;
import btp.bookingtradeplatform.Model.Request.MomoPaymentRequest;
import btp.bookingtradeplatform.Model.Response.MomoPaymentResponse;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Model.UpdateRequest.UpdatePaymentForm;
import btp.bookingtradeplatform.Service.MomoPaymentService;
import btp.bookingtradeplatform.Service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private MomoPaymentService momoService;

    @GetMapping("/all")
    public ResponseEntity<ResponseData<List<PaymentDTO>>> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseData<PaymentDTO>> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseData<PaymentDTO>> createPayment(@RequestBody CreatePaymentRequest request) {
        return paymentService.createPayment(request);
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<ResponseData<PaymentDTO>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody UpdatePaymentForm request) {
        return paymentService.updatePaymentStatus(id, request);
    }

    @PostMapping("/confirm/{id}")
    public ResponseEntity<ResponseData<Void>> confirmPayment(
            @PathVariable Long paymentId){
        return paymentService.confirmPayment(paymentId);
    }


    @PostMapping("/vnpay/{orderId}")
    public ResponseEntity<ResponseData<String>> createVnPayPayment(@PathVariable Long orderId) {
        return paymentService.createVnPayPayment(orderId);
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<ResponseData<String>> vnPayReturn(@RequestParam Map<String, String> params) {
        return paymentService.handleVnPayReturn(params);
    }
}
