package btp.bookingtradeplatform.Model.Request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterSellerRequest {


    private String username;


    private String email;

    private String password;


    private String fullName;

    private String profileImage;


    private String phone;


    private String storeName;


    private String storeAddress;

    private String storeDescription;
}
