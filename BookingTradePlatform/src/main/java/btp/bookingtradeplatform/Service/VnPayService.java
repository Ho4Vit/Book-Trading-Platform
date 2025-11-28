package btp.bookingtradeplatform.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VnPayService {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.payUrl}")
    private String payUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    /**
     * Tạo URL thanh toán VNPay theo transactionId
     */
    public String createPaymentUrl(String transactionId, long amount) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", tmnCode);
            params.put("vnp_Amount", String.valueOf(amount * 100));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", transactionId); // dùng transactionId
            params.put("vnp_OrderInfo", "Thanh toan don hang " + transactionId);
            params.put("vnp_Locale", "vn");
            params.put("vnp_OrderType", "other");
            params.put("vnp_ReturnUrl", returnUrl);
            params.put("vnp_IpAddr", "127.0.0.1");

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            params.put("vnp_CreateDate", LocalDateTime.now().format(formatter));

            List<String> fieldList = new ArrayList<>(params.keySet());
            Collections.sort(fieldList);

            StringBuilder signData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            for (String field : fieldList) {
                String value = params.get(field);
                if (value != null) {
                    signData.append(field).append("=").append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
                    signData.append("&");

                    query.append(URLEncoder.encode(field, StandardCharsets.US_ASCII));
                    query.append("=").append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
                    query.append("&");
                }
            }

            String rawHash = signData.substring(0, signData.length() - 1);
            String secureHash = hmacSHA512(hashSecret, rawHash);

            query.append("vnp_SecureHash=").append(secureHash);

            return payUrl + "?" + query;

        } catch (Exception e) {
            throw new RuntimeException("Error creating VNPay URL: " + e.getMessage());
        }
    }

    private String hmacSHA512(String key, String data) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA512");
        javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(key.getBytes(), "HmacSHA512");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder result = new StringBuilder();
        for (byte b : hash) result.append(String.format("%02x", b));
        return result.toString();
    }
}
