package btp.bookingtradeplatform.Config;

import btp.bookingtradeplatform.Model.Entity.Customer;
import btp.bookingtradeplatform.Model.Entity.User;
import btp.bookingtradeplatform.Model.Enum.Role;
import btp.bookingtradeplatform.Repository.CustomerRepository;
import btp.bookingtradeplatform.Repository.OrderRepository;
import btp.bookingtradeplatform.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra tồn tại theo username hoặc email
        Optional<User> existingUserByUsername = userRepository.findByUsername(adminUsername);
        Optional<User> existingUserByEmail = userRepository.findByEmail(adminEmail);

        if (existingUserByUsername.isEmpty() && existingUserByEmail.isEmpty()) {
            Customer admin = new Customer();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setIsActive(true);
            admin.setIsEmailVerified(true);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setLastLoginAt(LocalDateTime.now());

            userRepository.save(admin);

            System.out.println("Admin account created: username=" + adminUsername + ", email=" + adminEmail);
        } else {
            System.out.println("Admin account already exists. Skipping creation.");
        }
    }
}
