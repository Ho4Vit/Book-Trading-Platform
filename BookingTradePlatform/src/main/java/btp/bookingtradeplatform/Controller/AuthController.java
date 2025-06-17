package btp.bookingtradeplatform.Controller;

import btp.bookingtradeplatform.Model.DTO.AuthDTO;
import btp.bookingtradeplatform.Model.Request.AuthRequest;

import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Service.AuthService;

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

    @PostMapping("/login")
    public ResponseEntity<ResponseData<AuthDTO>> login(@RequestBody AuthRequest authRequest) {
        return authService.login(authRequest);
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseData<Void>> logout(HttpServletRequest request) {
        String token = authService.extractTokenFromRequest(request);
        return authService.logout(token);
    }
}
