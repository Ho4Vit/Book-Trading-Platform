package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.Entity.User;
import btp.bookingtradeplatform.Model.Request.EmailRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Repository.BookRepository;
import btp.bookingtradeplatform.Repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;
@Transactional
@Service
public class MailSenderService {

    @Autowired
    private JavaMailSender emailSender;
    @Autowired
    private TemplateEngine templateEngine;
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BookService bookService;

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        return String.valueOf(100000 + random.nextInt(900000));
    }



    public ResponseEntity<ResponseData<Void>> sendOtp(EmailRequest emailRequest) throws MessagingException {
        String email = emailRequest.getEmail();
        String otp = generateOtp();

        // Lưu OTP vào Redis
        redisTemplate.opsForValue().set("otp:" + email, otp, 5, TimeUnit.MINUTES);

        // Chuẩn bị nội dung email
        Context context = new Context();
        context.setVariable("otp", otp);
        String emailContent = templateEngine.process("OTP", context);

        // Gửi email bất đồng bộ
        bookService.sendOtpAsync(email, otp, emailContent);

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
        if  (validOTP) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException(AppException.NOT_FOUND));
            user.setIsOauth2(true);
            user.setIsEmailVerified(true);
        }

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        validOTP
                ));

    }
}
