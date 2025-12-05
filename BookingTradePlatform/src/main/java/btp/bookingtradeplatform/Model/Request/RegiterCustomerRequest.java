package btp.bookingtradeplatform.Model.Request;

import btp.bookingtradeplatform.Model.Enum.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class RegiterCustomerRequest {


    private String username;


    private String email;


    private String password;


    private String fullName;

    private String profileImage;


    private String phone;


    private String address;


    private LocalDate dateOfBirth;
    
    private Gender gender;
}
