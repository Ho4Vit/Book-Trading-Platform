package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Config.JWT.JwtProvider;
import btp.bookingtradeplatform.Config.JWT.TokenBlacklistService;
import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.AuthDTO;
import btp.bookingtradeplatform.Model.DTO.BookDTO;
import btp.bookingtradeplatform.Model.Entity.User;
import btp.bookingtradeplatform.Model.Request.AuthRequest;
import btp.bookingtradeplatform.Model.Request.ForgorPasswordRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Repository.CustomerRepository;
import btp.bookingtradeplatform.Repository.SellerRepository;

import btp.bookingtradeplatform.Repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Transactional
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private LoginFailureService loginFailureService;

    @Autowired
    private MailSenderService mailSenderService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private UserDetailsService userDetailsService;

    public ResponseEntity<ResponseData<AuthDTO>> login(AuthRequest authRequest, HttpServletRequest request) {
        String ip = request.getRemoteAddr();

        if (loginFailureService.isBlocked(ip)) {
            return ResponseEntity
                    .status(AppException.FORBIDDEN.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.FORBIDDEN.getCode(),
                            "IP của bạn đã bị chặn tạm thời do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.",
                            null
                    ));
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getUsername(),
                            authRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            loginFailureService.recordFailure(ip);
            return ResponseEntity
                    .status(AppException.INVALID_CREDENTIALS.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.INVALID_CREDENTIALS.getCode(),
                            "Tài khoản hoặc mật khẩu không đúng.",
                            null
                    ));
        } catch (Exception e) {
            return ResponseEntity
                    .status(AppException.INTERNAL_SERVER_ERROR.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.INTERNAL_SERVER_ERROR.getCode(),
                            "Lỗi hệ thống.",
                            null
                    ));
        }

        loginFailureService.resetFailures(ip);

        Optional<User> userOptional =
                customerRepository.findByUsername(authRequest.getUsername()).map(c -> (User) c)
                        .or(() -> customerRepository.findByEmail(authRequest.getUsername()).map(c -> (User) c))
                        .or(() -> sellerRepository.findByUsername(authRequest.getUsername()).map(s -> (User) s))
                        .or(() -> sellerRepository.findByEmail(authRequest.getUsername()).map(s -> (User) s));

        User user = userOptional.orElseThrow(() -> new BusinessException(AppException.INVALID_CREDENTIALS));

        // ✅ THÊM CHECK EMAIL CHƯA VERIFY
        if (user.getIsEmailVerified() == null || !user.getIsEmailVerified()) {
            return ResponseEntity
                    .status(AppException.EMAIL_NOT_VERIFIED.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.EMAIL_NOT_VERIFIED.getCode(),
                            "Email của bạn chưa được xác minh. Vui lòng kiểm tra email để kích hoạt tài khoản.",
                            null
                    ));
        }


        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtProvider.generateToken(userDetails);

        return ResponseEntity
                .status(AppException.SUCCESS.getHttpStatus())
                .body(new ResponseData<>(
                        AppException.SUCCESS.getCode(),
                        AppException.SUCCESS.getMessage(),
                        new AuthDTO(token, user.getRole(), user.getId())
                ));
    }


    public ResponseEntity<ResponseData<Void>> logout(String token) {
        try {
            Date expiration = Jwts.parserBuilder()
                    .setSigningKey(jwtProvider.getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();

            long ttl = expiration.getTime() - System.currentTimeMillis();

            tokenBlacklistService.blacklistToken(token, ttl);

            return ResponseEntity
                    .status(AppException.SUCCESS.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.SUCCESS.getCode(),
                            "Đăng xuất thành công",
                            null
                    ));

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            return ResponseEntity
                    .status(AppException.TOKEN_EXPIRED.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.TOKEN_EXPIRED.getCode(),
                            AppException.TOKEN_EXPIRED.getMessage(),
                            null
                    ));

        } catch (Exception e) {
            return ResponseEntity
                    .status(AppException.TOKEN_INVALID.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.TOKEN_INVALID.getCode(),
                            AppException.TOKEN_INVALID.getMessage(),
                            null
                    ));
        }
    }



    public String extractTokenFromRequest(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    public ResponseEntity<ResponseData<Void>> forgotPassword(ForgorPasswordRequest request) {
        Boolean isValid= mailSenderService.verifyOtp(request.getEmail(),request.getOtp()).getBody().getData();

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(AppException.USER_NOT_FOUND));

        if(!isValid) {
            return ResponseEntity
                    .status(AppException.OTP_INVALID.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.OTP_INVALID.getCode(),
                            AppException.OTP_INVALID.getMessage(),
                            null
                    ));
        }
        else {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            return ResponseEntity
                    .status(AppException.SUCCESS.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.SUCCESS.getCode(),
                            "Đặt lại mật khẩu thành công",
                            null
                    ));
        }
    }

    public ResponseEntity<ResponseData<AuthDTO>> refreshToken(String oldRefreshToken) {
        // 1. Kiểm tra token có bị blacklist không
        if (tokenBlacklistService.isTokenBlacklisted(oldRefreshToken)) {
            return ResponseEntity
                    .status(AppException.TOKEN_INVALID.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.TOKEN_INVALID.getCode(),
                            "Refresh token không hợp lệ hoặc đã bị thu hồi",
                            null
                    ));
        }

        try {
            // 2. Parse token cũ
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtProvider.getKey())
                    .build()
                    .parseClaimsJws(oldRefreshToken)
                    .getBody();

            String username = claims.getSubject();
            @SuppressWarnings("unchecked")
            var roles = (List<String>) claims.get("roles"); // lấy roles từ payload

            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            // Lấy User từ DB để có userId và role enum
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Tạo token mới
            String newAccessToken = jwtProvider.generateToken(userDetails);
            String newRefreshToken = jwtProvider.generateRefreshTokenWithRoles(username, roles);

            // Blacklist token cũ
            long ttl = claims.getExpiration().getTime() - System.currentTimeMillis();
            tokenBlacklistService.blacklistToken(oldRefreshToken, ttl);

            // Trả về AuthDTO với access token mới, role và userId
            AuthDTO authDTO = AuthDTO.builder()
                    .token(newAccessToken)
                    .role(user.getRole())
                    .userId(user.getId())
                    .build();

            return ResponseEntity
                    .status(AppException.SUCCESS.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.SUCCESS.getCode(),
                            "Refresh token thành công",
                            authDTO
                    ));

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            return ResponseEntity
                    .status(AppException.TOKEN_EXPIRED.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.TOKEN_EXPIRED.getCode(),
                            "Refresh token đã hết hạn",
                            null
                    ));
        } catch (Exception e) {
            return ResponseEntity
                    .status(AppException.TOKEN_INVALID.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.TOKEN_INVALID.getCode(),
                            "Refresh token không hợp lệ",
                            null
                    ));
        }
    }


}
