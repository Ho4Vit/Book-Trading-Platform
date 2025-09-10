package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.AuthDTO;
import btp.bookingtradeplatform.Model.Request.AuthRequest;

import btp.bookingtradeplatform.Model.Request.EmailRequest;
import btp.bookingtradeplatform.Model.Request.ForgorPasswordRequest;
import btp.bookingtradeplatform.Model.Request.VeryfiedOTPRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Service.AuthService;

import btp.bookingtradeplatform.Service.MailSenderService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private MailSenderService mailSenderService;

    @PostMapping("/login")
    public ResponseEntity<ResponseData<AuthDTO>> login(@RequestBody AuthRequest authRequest, HttpServletRequest request) {
        return authService.login(authRequest,request);
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseData<Void>> logout(HttpServletRequest request) {
        String token = authService.extractTokenFromRequest(request);
        return authService.logout(token);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseData<Void>> forgotPassword(@RequestBody ForgorPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/otp")
    public ResponseEntity<ResponseData<Void>> sendOtp(@RequestBody EmailRequest email) throws MessagingException {
        return mailSenderService.sendOtp(email);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ResponseData<Boolean>> verifyOtp(@RequestBody VeryfiedOTPRequest veryfiedOTPRequest) {
        String email = veryfiedOTPRequest.getEmail();
        String otpInput = veryfiedOTPRequest.getOtpInput();
        return mailSenderService.verifyOtp(email, otpInput);
    }
}
