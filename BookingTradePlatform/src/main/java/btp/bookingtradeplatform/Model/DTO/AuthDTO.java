package btp.bookingtradeplatform.Model.DTO;

import btp.bookingtradeplatform.Model.Enum.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthDTO {
    private String token;
    private Role role;
    private Long userId;
}
