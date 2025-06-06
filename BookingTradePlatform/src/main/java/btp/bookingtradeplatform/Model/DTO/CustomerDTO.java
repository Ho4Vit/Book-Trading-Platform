package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Entity.Customer;
import btp.bookingtradeplatform.Model.Enum.Gender;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CustomerDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String profileImage;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Gender gender;

    public static CustomerDTO fromEntity(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setUsername(customer.getUsername());
        dto.setEmail(customer.getEmail());
        dto.setFullName(customer.getFullName());
        dto.setProfileImage(customer.getProfileImage());
        dto.setPhone(customer.getPhone());
        dto.setAddress(customer.getAddress());
        dto.setDateOfBirth(customer.getDateOfBirth());
        dto.setGender(customer.getGender());
        return dto;
    }
}
