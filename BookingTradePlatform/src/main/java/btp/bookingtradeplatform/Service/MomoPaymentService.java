package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Model.Entity.Payment;
import btp.bookingtradeplatform.Model.Enum.PaymentMethod;
import btp.bookingtradeplatform.Model.Enum.PaymentStatus;
import btp.bookingtradeplatform.Model.Request.MomoPaymentRequest;
import btp.bookingtradeplatform.Model.Response.MomoPaymentResponse;
import btp.bookingtradeplatform.Repository.PaymentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

        // 🔹 Chuỗi ký chuẩn MoMo
        String rawSignature = String.format(
                "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                accessKey, (long) request.getAmount(), extraData, request.getNotifyUrl(),
                orderId, orderInfo, partnerCode, request.getReturnUrl(), requestId, requestType
        );

        String signature = hmacSHA256(rawSignature, secretKey);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("partnerCode", partnerCode);
        payload.put("accessKey", accessKey);
        payload.put("requestId", requestId);
        payload.put("amount", (long) request.getAmount());
        payload.put("orderId", orderId);
        payload.put("orderInfo", orderInfo);
        payload.put("redirectUrl", request.getReturnUrl());
        payload.put("ipnUrl", request.getNotifyUrl());
        payload.put("extraData", extraData);
        payload.put("requestType", requestType);
        payload.put("lang", "vi");
        payload.put("signature", signature);

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
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(request.getAmount()))
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
}
