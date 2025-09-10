package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Model.Request.EmailRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
public class MailSenderService {

    @Autowired
    private JavaMailSender emailSender;
    @Autowired
    private TemplateEngine templateEngine;
    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        return String.valueOf(100000 + random.nextInt(900000));
    }

    public ResponseEntity<ResponseData<Void>> sendOtp(EmailRequest emailRequest) throws MessagingException {
        String email= emailRequest.getEmail();
        String otp = generateOtp();
        redisTemplate.opsForValue().set("otp:" + email, otp, 5, TimeUnit.MINUTES);
        Context context = new Context();
        context.setVariable("otp", otp);
        String emailContent = templateEngine.process("OTP", context);

        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(email);
        helper.setSubject("Mã OTP của bạn");
        helper.setText(emailContent, true);
        emailSender.send(message);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        null
                ));
    }

    public ResponseEntity<ResponseData<Boolean>> verifyOtp(String email, String otpInput) {
        String key = "otp:" + email;
        String correctOtp = redisTemplate.opsForValue().get(key);
        Boolean validOTP = otpInput.equals(correctOtp);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        validOTP
                ));

    }
}
