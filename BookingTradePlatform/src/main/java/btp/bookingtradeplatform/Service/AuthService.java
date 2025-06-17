package btp.bookingtradeplatform.Service;

import btp.bookingtradeplatform.Config.JWT.JwtProvider;
import btp.bookingtradeplatform.Config.JWT.TokenBlacklistService;
import btp.bookingtradeplatform.Exception.AppException;
import btp.bookingtradeplatform.Exception.BusinessException;
import btp.bookingtradeplatform.Model.DTO.AuthDTO;
import btp.bookingtradeplatform.Model.DTO.BookDTO;
import btp.bookingtradeplatform.Model.Entity.User;
import btp.bookingtradeplatform.Model.Request.AuthRequest;
import btp.bookingtradeplatform.Model.Response.ResponseData;
import btp.bookingtradeplatform.Repository.CustomerRepository;
import btp.bookingtradeplatform.Repository.SellerRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Date;
import java.util.Optional;

@Service
public class AuthService {

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
    private PasswordEncoder passwordEncoder;

    public ResponseEntity<ResponseData<AuthDTO>> login(AuthRequest authRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getUsername(),
                            authRequest.getPassword()
                    )
            );

        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(AppException.INVALID_CREDENTIALS.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.INVALID_CREDENTIALS.getCode(),
                            AppException.INVALID_CREDENTIALS.getMessage(),
                            null
                    ));
        } catch (Exception e) {
            return ResponseEntity
                    .status(AppException.INTERNAL_SERVER_ERROR.getHttpStatus())
                    .body(new ResponseData<>(
                            AppException.INTERNAL_SERVER_ERROR.getCode(),
                            AppException.INTERNAL_SERVER_ERROR.getMessage(),
                            null
                    ));
        }
        Optional<User> userOptional =
                customerRepository.findByUsername(authRequest.getUsername()).map(c -> (User) c)
                        .or(() -> customerRepository.findByEmail(authRequest.getUsername()).map(c -> (User) c))
                        .or(() -> sellerRepository.findByUsername(authRequest.getUsername()).map(s -> (User) s))
                        .or(() -> sellerRepository.findByEmail(authRequest.getUsername()).map(s -> (User) s));

        User user = userOptional.orElseThrow(() -> new BusinessException(AppException.INVALID_CREDENTIALS));

        String token = jwtProvider.generateToken(user.getUsername(), Collections.singletonList("ROLE_" + user.getRole().name()));

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

            tokenBlacklistService.blacklistToken(token);

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
}
