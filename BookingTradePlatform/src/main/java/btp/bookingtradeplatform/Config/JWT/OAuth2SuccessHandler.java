package btp.bookingtradeplatform.Config.JWT;

import btp.bookingtradeplatform.Config.JWT.JwtProvider;
import btp.bookingtradeplatform.Model.Entity.Customer;
import btp.bookingtradeplatform.Model.Entity.User;
import btp.bookingtradeplatform.Model.Enum.Role;
import btp.bookingtradeplatform.Repository.CustomerRepository;
import btp.bookingtradeplatform.Repository.UserRepository;
import btp.bookingtradeplatform.Service.CustomUserDetailsService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService customUserDetailsService;

    private final String REDIRECT_URL = "http://localhost:3000/oauth2/success?token=";
    private final CustomerRepository customerRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        User user;
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isEmpty()) {
            Customer newCustomer = new Customer();
            newCustomer.setEmail(email);
            newCustomer.setFullName(name);
            newCustomer.setProfileImage(picture);
            newCustomer.setRole(Role.CUSTOMER);
            newCustomer.setIsActive(true);
            newCustomer.setCreatedAt(LocalDateTime.now());
            newCustomer.setLastLoginAt(LocalDateTime.now());
            customerRepository.save(newCustomer);
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        String token = jwtProvider.generateToken(userDetails);

        response.sendRedirect(REDIRECT_URL + token);
    }
}
