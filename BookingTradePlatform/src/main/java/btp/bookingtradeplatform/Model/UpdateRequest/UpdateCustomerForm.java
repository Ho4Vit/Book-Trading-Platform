package btp.bookingtradeplatform.Model.UpdateRequest;

import btp.bookingtradeplatform.Model.Enum.Gender;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;


@Getter
@Setter
public class UpdateCustomerForm {
    private String fullName;
    private String profileImage;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;
}
