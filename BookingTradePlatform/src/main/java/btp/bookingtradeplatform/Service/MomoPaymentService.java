package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.Entity.Order;
import btp.bookingtradeplatform.Model.Entity.Payment;
import btp.bookingtradeplatform.Model.Enum.OrderStatus;
import btp.bookingtradeplatform.Model.Enum.PaymentMethod;
import btp.bookingtradeplatform.Model.Enum.PaymentStatus;
import btp.bookingtradeplatform.Model.Request.MomoPaymentRequest;
import btp.bookingtradeplatform.Model.Response.MomoPaymentResponse;
import btp.bookingtradeplatform.Repository.OrderRepository;
import btp.bookingtradeplatform.Repository.PaymentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoPaymentService {

    private final PaymentRepository paymentRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Value("${momo.partnerCode}")
    private String partnerCode;

    @Value("${momo.accessKey}")
    private String accessKey;

    @Value("${momo.secretKey}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String endpoint;

    /**
     * Tạo yêu cầu thanh toán qua MoMo Sandbox
     */
    public MomoPaymentResponse createPayment(MomoPaymentRequest request) throws Exception {
        String requestId = UUID.randomUUID().toString();
        String orderId = String.valueOf(request.getOrderId());
        String orderInfo = request.getOrderInfo();
        String requestType = "captureWallet";
        String extraData = "";

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
        BigDecimal totalPrice = order.getTotalPrice()
                .subtract(request.getDiscount());
        long amount = totalPrice.longValue();

        // 🔹 Chuỗi ký chuẩn MoMo
        String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                accessKey, amount, extraData, request.getNotifyUrl(),
                orderId, orderInfo, partnerCode, request.getReturnUrl(), requestId, requestType
        );

        String signature = hmacSHA256(rawSignature, secretKey);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", partnerCode);
        payload.put("accessKey", accessKey);
        payload.put("requestId", requestId);
        payload.put("amount", amount);
        payload.put("orderId", orderId);
        payload.put("orderInfo", orderInfo);
        payload.put("redirectUrl", request.getReturnUrl());
        payload.put("ipnUrl", request.getNotifyUrl());
        payload.put("extraData", extraData);
        payload.put("requestType", requestType);
        payload.put("lang", "vi");
        payload.put("signature", signature);
        payload.put("requestExpiredTime", 120);

        log.info("🔹 Sending MoMo payload: {}", payload);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        ResponseEntity<MomoPaymentResponse> response = restTemplate.postForEntity(
                endpoint, entity, MomoPaymentResponse.class);

        MomoPaymentResponse momoResponse = response.getBody();

        if (momoResponse == null || !"0".equals(momoResponse.getResultCode())) {
            throw new RuntimeException("MoMo error: " + (momoResponse != null ? momoResponse.getMessage() : "unknown error"));
        }


        // ✅ Lưu Payment vào DB
        assert order != null;
        Payment payment = Payment.builder()
                .amount(order.getTotalPrice())
                .order(order)
                .method(PaymentMethod.MOMO)
                .status(PaymentStatus.PENDING)
                .paymentDate(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        return momoResponse;
    }

    /**
     * Tạo chữ ký SHA256
     */
    private String hmacSHA256(String data, String secretKey) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(data.getBytes());
        StringBuilder result = new StringBuilder();
        for (byte b : hash) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    public String handleCallback(Map<String, Object> data) {
        try {
            String resultCode = String.valueOf(data.get("resultCode"));
            Long orderId = Long.parseLong(String.valueOf(data.get("orderId")));

            Payment payment = paymentRepository.findByOrderId(orderId);
            if (payment == null) return "Payment not found for orderId: " + orderId;

            if ("0".equals(resultCode)) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.getOrder().setStatus(OrderStatus.CONFIRMED);
                orderService.decreaseStockForOrder(payment.getOrder());
                payment.setAccepted(true);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.getOrder().setStatus(OrderStatus.CANCELLED);
                orderService.reverseStockForOrder(payment.getOrder());
            }

            paymentRepository.save(payment);
            return "Callback processed for orderId: " + orderId + ", resultCode=" + resultCode;

        } catch (Exception e) {
            log.error("Callback error: {}", e.getMessage());
            return "Callback Error: " + e.getMessage();
        }
    }

}
