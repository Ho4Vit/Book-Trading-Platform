package btp.bookingtradeplatform.Model.Entity;

import btp.bookingtradeplatform.Model.Enum.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class User {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;
    private String fullName;
    private String profileImage;

    @Enumerated(EnumType.STRING)
    private Role role; // CUSTOMER, SELLER, ADMIN

    private Boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
