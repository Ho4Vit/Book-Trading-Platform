package btp.bookingtradeplatform.Model.Entity;

import btp.bookingtradeplatform.Model.Enum.Gender;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Customer extends User {
    private String phone;
    private String address;
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender; // MALE, FEMALE, OTHER

    private Integer loyaltyPoint;

}
